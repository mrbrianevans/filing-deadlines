<script lang="ts">

  import {ActionIcon, Alert, Container, Group, Loader, NativeSelect, Text, Title, Tooltip} from "@svelteuidev/core";
  import {fetcher} from "../lib/swr.js";
  import {onMount} from "svelte";
  import {Reload} from "radix-icons-svelte";
  import ErrorAlert from "../components/ErrorAlert.svelte";
  import type {RecentFilings, RecentFilingsItem} from "../../../fs-shared/RecentFilings.js";
  import type {TableColumns} from "svelte-table/src/types.js";
  import AsyncDate from "../components/AsyncDate.svelte";
  import LinkToViewDocument from "../components/recentFilings/LinkToViewDocument.svelte";
  import FilingDescription from "../components/recentFilings/FilingDescription.svelte";

  let recentFilings: RecentFilings|null = null, error, processing // manual SWR

  async function loadRecentFilings(timespan = 'P7D'){
    processing = true
    try{
      const Temporal = await import('@js-temporal/polyfill').then(m=>m.Temporal)
      const startDate = Temporal.Now.plainDateISO().subtract(timespan)
      recentFilings = await fetcher('/api/user/org/member/recent-filings?startDate='+startDate.toString())
    }catch (e) {
      error = e
      recentFilings = null
    }finally {
      processing = false
    }
  }
  onMount(()=>loadRecentFilings())
  const SvelteTablePromise = import('svelte-table').then(m=>m.default)
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
  const timespans = {'7 days': 'P7D', '14 days': 'P14D', '30 days': 'P30D', '60 days': 'P60D'}
  let selectedTimespan = '7 days'
  $: loadRecentFilings(timespans[selectedTimespan]) // should reload data when selectedTimespan changes
  const featureLive = true
</script>

<Container size="xl">
    <Title order={2}>Recent filings</Title>

    {#if featureLive}
    <Group>
        <NativeSelect data={['7 days', '14 days', '30 days', '60 days']} bind:value={selectedTimespan}></NativeSelect>
        <Tooltip label="Reload recent filings list" withArrow>
            <ActionIcon on:click={()=>loadRecentFilings(timespans[selectedTimespan])} loading="{processing}"><Reload/></ActionIcon>
        </Tooltip>
    </Group>
    {#if error}
        <ErrorAlert error="{error}"/>
    {:else if recentFilings}
        {#each Object.keys(recentFilings) as filingType}
            <Title order="{4}" transform='capitalize'>{filingType}</Title>
            {#await SvelteTablePromise}
                <Loader/>
            {:then SvelteTable}
                    <SvelteTable columns={columns} rows={recentFilings[filingType]}/>
            {/await}
        {/each}
    {/if}
        {:else}
        <Alert>
            <Text inherit>This feature is not yet ready, but coming soon. Try again tomorrow :)</Text>
            <Text inherit>It will show the recent filings for your clients made to Companies House, broken down by the type of filing (accounts, confirmation statement etc).</Text>
        </Alert>
    {/if}


    </Container>
<style>

</style>
