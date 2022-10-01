<script lang="ts">

  import {
    ActionIcon,
    Alert, Badge,
    Button,
    Container,
    Group,
    Loader,
    NativeSelect,
    Text,
    Title,
    Tooltip
  } from "@svelteuidev/core";
  import {fetcher} from "../lib/swr.js";
  import {onMount} from "svelte";
  import {Reload} from "radix-icons-svelte";
  import ErrorAlert from "../components/ErrorAlert.svelte";
  import type {RecentFilings, RecentFilingsItem} from "../../../fs-shared/RecentFilings.js";
  import type {TableColumns} from "svelte-table/src/types.js";
  import AsyncDate from "../components/AsyncDate.svelte";
  import LinkToViewDocument from "../components/recentFilings/LinkToViewDocument.svelte";
  import FilingDescription from "../components/recentFilings/FilingDescription.svelte";
  import { sentenceCase } from "sentence-case";
  import AsyncTable from "../components/AsyncTable.svelte";
  import {exportRecentFilingsPdf} from "../lib/exportFormats/exportRecentFilingsPdf.js";
  import {user} from "../lib/stores/user.js";
  import {downloadBlob} from "../lib/exportFormats/downloadBlob.js";
  import {exportRecentFilingsXlsx} from "../lib/exportFormats/exportRecentFilingsXlsx.js";
  let recentFilings: RecentFilings|null = null, error, processing // manual SWR
  let showingFilingsSince
  async function loadRecentFilings(timespan = 'P7D'){
    processing = true
    try{
      const Temporal = await import('@js-temporal/polyfill').then(m=>m.Temporal)
      const startDate = Temporal.Now.plainDateISO().subtract(timespan)
      recentFilings = await fetcher('/api/user/org/member/recent-filings?startDate='+startDate.toString())
      showingFilingsSince = startDate.toString()
    }catch (e) {
      error = e
      recentFilings = null
      showingFilingsSince = null
    }finally {
      processing = false
    }
  }
  const timespans = {'1 day': 'P1D','3 days': 'P3D','7 days': 'P7D', '14 days': 'P14D', '30 days': 'P30D', '60 days': 'P60D', '6 months': 'P6M'}
  let selectedTimespan // this is the human-readable string eg 7 days, starts undefined
  const getTimespan = ()=>selectedTimespan?timespans[selectedTimespan]:(new URLSearchParams(window.location.search).get('p') || undefined)
  onMount(()=> {
    // get initial value from URL query on mount. Eg /recent-filings?p=P1D. Some other components redirect here like that.
    loadRecentFilings(getTimespan())
  })

  const columns: TableColumns<RecentFilingsItem> = [
    {
      key: 'companyNumber',
      value: v=>v.companyNumber,
      title: "Company number"
    },
    {
      key: 'companyName',
      value: v=>v.companyName,
      title: "Name"
    },
    {
      key: 'filingDate',
      value: v=>v.filingDate,
      title: "Filing date",
      renderComponent: {
        component: AsyncDate,
        props: {valueGetter: v=>v.filingDate}
      }
    },
    {
      key: 'description',
      value: v=>v.description,
      title: "Description",
      renderComponent: {
        component: FilingDescription,
        props: {getFilingDescription: v=>v.description}
      }
    },
    {
      key: 'linkToDocument',
      value: v=>v.transactionId,
      title: "View document",
      renderComponent: {
        component: LinkToViewDocument,
        props: {companyNumberGetter: v=>v.companyNumber, transactionIdGetter: v=>v.transactionId}
      }
    }
  ]
  $: loadRecentFilings(getTimespan()) // should reload data when selectedTimespan changes
  let exportingPdf = false, exportingXlsx = false
  async function exportPdf(){
    exportingPdf = true
    const blob = await exportRecentFilingsPdf(recentFilings, showingFilingsSince, new Date().toISOString().split('T')[0], $user.name)
    downloadBlob(blob, 'recent filings.pdf')
    exportingPdf = false
  }
  async function exportXlsx(){
    exportingXlsx = true
    await exportRecentFilingsXlsx(recentFilings)
    exportingXlsx = false
  }
</script>

<Container size="xl">
    <Title order={2}>Recent filings</Title>

    <Group>
        <NativeSelect data={Object.keys(timespans)} bind:value={selectedTimespan} placeholder="Choose time period"></NativeSelect>
        <Tooltip label="Reload recent filings list" withArrow>
            <ActionIcon on:click={()=>loadRecentFilings(getTimespan())} loading="{processing}"><Reload/></ActionIcon>
        </Tooltip>
        {#if showingFilingsSince}<Text>Showing filings since <AsyncDate date="{showingFilingsSince}"/></Text>{/if}
        <Button on:click={exportXlsx} variant="outline" color="green" loading="{exportingXlsx}" disabled="{!recentFilings || error || processing}">Export to XLSX</Button>
        <Button on:click={exportPdf} variant="outline" color="red" loading="{exportingPdf}" disabled="{!recentFilings || error || processing}">Export to PDF</Button>
        <Tooltip label="Feature not available">
            <Button disabled>Export image</Button>
        </Tooltip>
    </Group>
    {#if error}
        <ErrorAlert error="{error}"/>
    {:else if recentFilings}
        <div>
            {#each Object.keys(recentFilings) as filingType}
                <Title order="{4}">{sentenceCase(filingType)} ({recentFilings[filingType].length})</Title>
                {#each [...new Set(recentFilings[filingType].filter(f=>f.subcategory).map(f=>f.subcategory))] as subcategory} <Badge>{subcategory}</Badge> {/each}
                <AsyncTable columns={columns} rows={recentFilings[filingType]}/>
            {/each}
        </div>
    {/if}
    </Container>
<style>

</style>
