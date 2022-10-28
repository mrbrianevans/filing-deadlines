<script lang="ts">

  import {dashboardData} from "../../lib/stores/dashboardData.js";
  import type {DashboardData, DashboardDataItem} from '../../../../fs-shared/DashboardData.js'
  import {getDaysLeftDuration,getDaysLeft} from '../../../../fs-shared/dates.js'
  import {onMount} from "svelte";
  import type {TableColumns} from "svelte-table/src/types.js";
  import CompanyName from "../../components/dashboard/CompanyName.svelte";
  import {Loader, Text, Title} from "@svelteuidev/core";
  import AnchoredLink from "../../components/AnchoredLink.svelte";
  import ErrorAlert from "../../components/ErrorAlert.svelte";
  import StatGroup from "../../components/StatGroup.svelte";
  import Stat from "../../components/Stat.svelte";

  const {error, processing} = dashboardData
  onMount(()=>dashboardData.refresh())


  const columns: TableColumns<DashboardDataItem> = [
    {
      key: 'company_name',
      title: 'Client',
      renderComponent: CompanyName,
      value: v=>v.company_name ?? ''
    },
    {
      key: 'days_left',
      title: 'Due date',
      value: v => getDaysLeftDuration(v.next_due_accounts)
    }
  ]
  const limit = 5
  $: overdueCount = $dashboardData?.filter(r=>getDaysLeft(r.next_due_accounts) < 0).length??0
  $: thisMonthCount = $dashboardData?.filter(r=> {
    const daysLeft = getDaysLeft(r.next_due_accounts)
    return daysLeft >= 0 && daysLeft < 31
  }).length??0
</script>

<div>
    <Title order={2}>Accounts deadlines</Title>
    <p>Upcoming accounts deadlines for your clients. <AnchoredLink href="/secure/accounts-dashboard">View full dashboard</AnchoredLink></p>
    <StatGroup>
        <Stat
                label="Overdue" description="Number of your clients whose annual accounts are overdue"
                data={overdueCount} red={Boolean(overdueCount)}
                loading={$processing}
        />
        <Stat
                label="Due this month" description="Number of your clients whose annual accounts are due with a month"
                data={thisMonthCount}
                loading={$processing}
        />
    </StatGroup>
    {#if $processing}
        <Loader color="gray"/>
    {:else if $error}
        <ErrorAlert error={$error}/>
    {:else if $dashboardData}
        {#if overdueCount + thisMonthCount > limit}<Text color="dimmed" size="xs" mt="md"> Only showing {limit} out of {overdueCount + thisMonthCount}.</Text>{/if}
        {#await import('svelte-table').then(m=>m.default)}
            <Loader color="gray"/>
        {:then SvelteTable}
                <SvelteTable columns="{columns}" rows={$dashboardData.filter(r=>getDaysLeft(r.next_due_accounts) < 31).slice(0,limit)}
                             sortBy="days_left" sortOrder="{1}"
                             rowKey="company_name" classNameTable="accounts-tile-table"
                >
                </SvelteTable>
        {/await}
    {/if}
</div>


<style>

</style>
