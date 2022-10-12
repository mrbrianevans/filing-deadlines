<script lang="ts">

  import {
    ActionIcon,
    Alert, Badge,
    Button,
    Container,
    Group,
    Loader,
    NativeSelect, Space,
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
  import {Link, useLocation, useNavigate} from "svelte-navigator";
  import AnchoredLink from "../components/AnchoredLink.svelte";
  const location = useLocation()
  const navigate = useNavigate();
  let recentFilings: RecentFilings|null = null, error, processing // manual SWR
  let showingFilingsSince
  $: filingTypes =  [...new Set(recentFilings?.map(f=>f.filingType))]
  async function loadRecentFilings(timespan = 'P7D'){
    console.log({timespan})
    processing = true
    try{
      const Temporal = await import('@js-temporal/polyfill').then(m=>m.Temporal)
      const startDate = Temporal.Now.plainDateISO().subtract(timespan)
      recentFilings = await fetcher('/api/user/org/member/recent-filings?startDate='+startDate.toString())
      showingFilingsSince = startDate.toString()
      error = null
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
  const getTimespan = (search) => new URLSearchParams(search).get('p') ?? 'P7D'
  onMount(()=> {
    // get initial value from URL query on mount. Eg /recent-filings?p=P1D. Some other components redirect here like that.
    const sp = new URLSearchParams($location.search)
    if(!sp.get('p')) {
      sp.set('p', 'P7D') // default period
      navigate('?' + sp.toString())
    }
    const duration = sp.get('p') // sets the value of the select, if its in the list
    selectedTimespan = Object.entries(timespans).find(([h, d])=>d===duration)?.[0] ?? undefined
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
  function updateSearchQuery(timespanDuration){
    const sp = new URLSearchParams($location.search)
    sp.set('p', timespanDuration)
    navigate('?'+sp.toString())
  }
  $: if(selectedTimespan) updateSearchQuery(timespans[selectedTimespan])
  $: loadRecentFilings(getTimespan($location.search)) // should reload data when selectedTimespan changes
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
            <ActionIcon on:click={()=>loadRecentFilings(getTimespan($location.search))} loading="{processing}"><Reload/></ActionIcon>
        </Tooltip>
        <Button on:click={exportXlsx} variant="outline" color="green" loading="{exportingXlsx}" disabled="{!recentFilings || recentFilings.length === 0 || error || processing}">Export to XLSX</Button>
        <Button on:click={exportPdf} variant="outline" color="red" loading="{exportingPdf}" disabled="{!recentFilings || recentFilings.length === 0 || error || processing}">Export to PDF</Button>
        <Tooltip label="Feature not available">
            <Button disabled>Export image</Button>
        </Tooltip>
        <Tooltip label="Feature not available">
            <Button disabled>Group by date</Button>
        </Tooltip>
        <Tooltip label="Feature not available">
            <Button disabled>Group by company</Button>
        </Tooltip>
        <Tooltip label="Subscribe to web notifications of new filings">
            <AnchoredLink href="/secure/notifications">Get notifications</AnchoredLink>
        </Tooltip>
    </Group>
    {#if error}
        <ErrorAlert error="{error}"/>
    {:else if recentFilings}
        {#if showingFilingsSince}<Text root="p" pt="sm">Showing filings since <AsyncDate date="{showingFilingsSince}"/></Text>{/if}
        {#if recentFilings.length > 0}
        <div>
            {#each filingTypes as filingType}
                <Title order="{4}">{sentenceCase(filingType)} ({recentFilings.filter(f=>f.filingType===filingType).length})</Title>
                {#each [...new Set(recentFilings.filter(f=>f.filingType===filingType).filter(f=>f.subcategory).map(f=>f.subcategory))] as subcategory} <Badge>{subcategory}</Badge> {/each}
                <AsyncTable columns={columns} rows={recentFilings.filter(f=>f.filingType===filingType)}/>
            {/each}
        </div>
        {:else}
        <Space h="sm"/>
        <Alert title="No recent filings" color="gray" variant="outline">
            <Text inherit>There haven't been any filings since {showingFilingsSince} for companies on your client list.</Text>
            <Text inherit>Try choosing a longer period or add some more clients to your client list.</Text>
        </Alert>
        {/if}
    {/if}
    </Container>
<style>

</style>
