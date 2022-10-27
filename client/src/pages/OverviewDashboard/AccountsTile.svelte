<script lang="ts">

  import {dashboardData} from "../../lib/stores/dashboardData.js";
  import type {DashboardData, DashboardDataItem} from '../../../../fs-shared/DashboardData.js'
  import {getDaysLeftDuration,getDaysLeft} from '../../../../fs-shared/dates.js'
  import {onMount} from "svelte";
  import type {TableColumns} from "svelte-table/src/types.js";
  import CompanyName from "../../components/dashboard/CompanyName.svelte";
  import {Loader} from "@svelteuidev/core";
  import AnchoredLink from "../../components/AnchoredLink.svelte";
  import ErrorAlert from "../../components/ErrorAlert.svelte";

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
    <h2>Accounts deadlines</h2>
    <p>Upcoming accounts deadlines for your clients. <AnchoredLink href="/secure/accounts-dashboard">View full dashboard</AnchoredLink></p>
    {#if $processing}
        <Loader/>
    {:else if $error}
        <ErrorAlert error={$error}/>
    {:else if $dashboardData}
        <p>{overdueCount} overdue, {thisMonthCount} due this month. {#if overdueCount + thisMonthCount > limit} Only showing {limit}.{/if}</p>
        {#await import('svelte-table').then(m=>m.default)}
            <Loader/>
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
