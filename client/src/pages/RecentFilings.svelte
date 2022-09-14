<script lang="ts">

  import {ActionIcon, Alert, Container, Group, Loader, NativeSelect, Title, Tooltip} from "@svelteuidev/core";
  import {fetcher} from "../lib/swr.js";
  import {onMount} from "svelte";
  import {InfoCircled, Reload} from "radix-icons-svelte";
  import ErrorAlert from "../components/ErrorAlert.svelte";
  import type {RecentFilings, RecentFilingsItem} from "../../../fs-shared/RecentFilings.js";
  import type {TableColumns} from "svelte-table/src/types.js";

  let recentFilings: RecentFilings|null = null, error, processing // manual SWR
  //todo: send timespan to server from NativeSelect
  async function loadRecentFilings(timespan = '7D'){
    processing = true
    try{
      const startDate = new Date(0)
      recentFilings = await fetcher('/api/user/org/member/recent-filings?startDate='+startDate.toISOString().split('T')[0])
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
    }
  ]
</script>

<Container>
    <Title order={2}>Recent filings</Title>

    <Group>
        <NativeSelect data={['7 days', '14 days', '30 days', '60 days']}></NativeSelect>
        <Tooltip label="Reload recent filings list" withArrow>
            <ActionIcon on:click={()=>loadRecentFilings()} loading="{processing}"><Reload/></ActionIcon>
        </Tooltip>
    </Group>
    {#if error}
        <ErrorAlert error="{error}"/>
    {:else if recentFilings}
        {#each Object.keys(recentFilings) as filingType}
            <Title order="{4}">{filingType}</Title>
            {#await SvelteTablePromise}
                <Loader/>
            {:then SvelteTable}
                    <SvelteTable columns={columns} rows={recentFilings[filingType]}/>
            {/await}
        {/each}
    {/if}


    </Container>
<style>

</style>
