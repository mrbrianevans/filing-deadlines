<script lang="ts">

  import {
    ActionIcon,
    Alert, Badge,
    Button,
    Container,
    Group,
    Loader,
    NativeSelect, Progress, Space,
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
  import { sentenceCase } from "change-case";
  import AsyncTable from "../components/AsyncTable.svelte";
  import {exportRecentFilingsPdf} from "../lib/exportFormats/exportRecentFilingsPdf.js";
  import {user} from "../lib/stores/user.js";
  import {downloadBlob} from "../lib/exportFormats/downloadBlob.js";
  import {exportRecentFilingsXlsx} from "../lib/exportFormats/exportRecentFilingsXlsx.js";
  import {Link, useLocation, useNavigate} from "svelte-navigator";
  import AnchoredLink from "../components/AnchoredLink.svelte";
  import {features} from "../lib/stores/features.js";
  import CompanyNumber from "../components/dashboard/CompanyNumber.svelte";
  const location = useLocation()
  const navigate = useNavigate();
  let recentFilings: { recentFilings: RecentFilings, completeData: boolean, missingCount :number, completeCount: number; }|null = null, error, processing // manual SWR
  let showingFilingsSince;
  // whether to display the max amount of time their plan supports
  let showPlanLimit = false;
  $: filingTypes =  [...new Set(recentFilings?.recentFilings.map(f=>f.filingType))]
  async function loadRecentFilings(timespan, max ){
    processing = true
    showPlanLimit = false
    try{
      const Temporal = await import('@js-temporal/polyfill').then(m=>m.Temporal)
      if(Temporal.Duration.from(timespan).total({unit: 'days', relativeTo: Temporal.Now.plainDateISO()}) > max) {
        showPlanLimit = true
        timespan = Temporal.Duration.from({days: max}).toString()
      }
      const startDate = Temporal.Now.plainDateISO().subtract(timespan)
      recentFilings = await fetcher('/api/user/org/member/recent-filings?startDate='+startDate.toString())
      showingFilingsSince = startDate.toString() // this assumes the server didn't change the date due to sub plan
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
      navigate('?' + sp.toString(), {replace: true})
    }
    const duration = sp.get('p') // sets the value of the select, if its in the list
    selectedTimespan = Object.entries(timespans).find(([h, d])=>d===duration)?.[0] ?? undefined
  })

  const columns: TableColumns<RecentFilingsItem> = [
    {
      key: 'companyNumber',
      value: v=>v.companyNumber,
      title: "Company number",
      renderComponent: {
        component: CompanyNumber,
        props: {getCompanyNumber: v=>v.companyNumber}
      }
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
    navigate('?'+sp.toString(), {replace: true})
  }
  $: if(selectedTimespan) updateSearchQuery(timespans[selectedTimespan])
  $: loadRecentFilings(getTimespan($location.search), $features.recentFilingsMaxPeriodDays) // should reload data when selectedTimespan changes
  let exportingPdf = false, exportingXlsx = false
  async function exportPdf(userName){
    exportingPdf = true
    const blob = await exportRecentFilingsPdf(recentFilings.recentFilings, showingFilingsSince, new Date().toISOString().split('T')[0], userName)
    downloadBlob(blob, 'recent filings.pdf')
    exportingPdf = false
  }
  async function exportXlsx(){
    exportingXlsx = true
    await exportRecentFilingsXlsx(recentFilings.recentFilings)
    exportingXlsx = false
  }
  $: exportsDisabled = !$features.exportData || !recentFilings || recentFilings.recentFilings.length === 0 || !recentFilings.completeData || error || processing
  let displayTimespans = Object.keys(timespans)
  $: import('@js-temporal/polyfill')
    .then(m=>m.Temporal)
    .then(Temporal=>{displayTimespans = Object.entries(timespans)
      .filter(([human, machine])=>Temporal.Duration.from(machine).total({unit: 'days', relativeTo: Temporal.Now.plainDateISO()}) <= $features.recentFilingsMaxPeriodDays)
      .map(e=>e[0])})
</script>

<Container size="xl">
    <Title order={2}>Recent filings</Title>

    <Group>
        <NativeSelect data={displayTimespans} bind:value={selectedTimespan} placeholder="Choose time period"></NativeSelect>
        <Tooltip label="Reload recent filings list" withArrow>
            <ActionIcon on:click={()=>loadRecentFilings(getTimespan($location.search), $features.recentFilingsMaxPeriodDays)} loading="{processing}"><Reload/></ActionIcon>
        </Tooltip>
        <Button on:click={exportXlsx} variant="outline" color="green" loading="{exportingXlsx}" disabled="{exportsDisabled}">Export to XLSX</Button>
        <Button on:click={()=>exportPdf($user.name)} variant="outline" color="red" loading="{exportingPdf}" disabled="{exportsDisabled}">Export to PDF</Button>
        <Tooltip label="Feature not available">
            <Button disabled>Export image</Button>
        </Tooltip>
        <Tooltip label="Feature not available">
            <Button disabled>Group by date</Button>
        </Tooltip>
        <Tooltip label="Feature not available">
            <Button disabled>Group by company</Button>
        </Tooltip>
        {#if $features.webNotifications}
            <Tooltip label="Subscribe to web notifications of new filings">
                <AnchoredLink href="/secure/notifications">Get notifications</AnchoredLink>
            </Tooltip>
        {/if}
    </Group>
    {#if showPlanLimit}
        <Space h="md"/>
      <Alert title="Subscription plan limit">
          <Text inherit>Your organisations current subscription plan only includes {$features.recentFilingsMaxPeriodDays} days of recent filings.</Text>
      </Alert>
    {:else if error}
        <ErrorAlert error="{error}"/>
    {:else if recentFilings}
        {#if !recentFilings.completeData}
            <Alert color="orange" my="md">
                <Group my="md">
                    <Loader color="orange" variant="bars"/>
                    <Text inherit>Your clients filing history is being loaded in the background. This page doesn't have complete information yet.
                        Expected to take {Math.ceil(recentFilings.missingCount/20) || 15} minutes to finish.</Text>
                </Group>
                <Progress tween value={(recentFilings.completeCount/(recentFilings.completeCount+ recentFilings.missingCount))*100} color="orange" size="lg"/>
            </Alert>
        {/if}
        {#if recentFilings.recentFilings.length > 0}
            {#if showingFilingsSince}<Text root="p" pt="sm">Showing filings since <AsyncDate date="{showingFilingsSince}"/></Text>{/if}
        <div>
            {#each filingTypes as filingType}
                <Title order="{4}">{sentenceCase(filingType)} ({recentFilings.recentFilings.filter(f=>f.filingType===filingType).length})</Title>
                {#each [...new Set(recentFilings.recentFilings.filter(f=>f.filingType===filingType).filter(f=>f.subcategory).map(f=>f.subcategory))] as subcategory} <Badge>{subcategory}</Badge> {/each}
                <AsyncTable columns={columns} rows={recentFilings.recentFilings.filter(f=>f.filingType===filingType)}/>
            {/each}
        </div>
        {:else if recentFilings.completeData}
        <Alert title="No recent filings" color="gray" variant="outline" my="md">
            <Text inherit>There haven't been any filings since {showingFilingsSince} for companies on your client list.</Text>
            <Text inherit>Try choosing a longer period or add some more clients to your client list.</Text>
        </Alert>
        {/if}
    {/if}
    </Container>
<style>

</style>
