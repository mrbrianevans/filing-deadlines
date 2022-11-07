<script lang="ts">

  import {dashboardData} from "../../lib/stores/dashboardData.js";
  import type {DashboardData, DashboardDataItem} from '../../../../fs-shared/DashboardData.js'
  import {getDaysLeftDuration, getDaysLeft, getLastDayOfMonth,months} from '../../../../fs-shared/dates.js'
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
  export let limit = 5
  $: overdueCount = $dashboardData?.filter(r=>getDaysLeft(r.next_due_accounts) < 0).length??0
  const endOfThisMonth = getLastDayOfMonth(new Date().getMonth())
  const endOfNextMonth = getLastDayOfMonth(new Date().getMonth() + 1)
  $: thisMonthCount = $dashboardData?.filter(r=> {
    return new Date(r.next_due_accounts).getTime() > Date.now() && new Date(r.next_due_accounts).getTime() <= endOfThisMonth.getTime()
  }).length??0
  $: nextMonthCount = $dashboardData?.filter(r=> {
    return new Date(r.next_due_accounts).getTime() > endOfThisMonth.getTime() && new Date(r.next_due_accounts).getTime() <= endOfNextMonth.getTime()
  }).length??0
</script>

<div>
    <StatGroup>
        <Stat
                label="Overdue" description="Number of your clients whose annual accounts are overdue"
                data={overdueCount} red={Boolean(overdueCount)}
                loading={$processing}
        />
        <Stat
                label="Due in {months[endOfThisMonth.getMonth()]}" description="Number of your clients whose annual accounts are due within a month"
                data={thisMonthCount}
                loading={$processing}
        />
        <Stat
                label="Due in {months[endOfNextMonth.getMonth()]}" description="Number of your clients whose annual accounts are due next month"
                data={nextMonthCount}
                loading={$processing}
        />
    </StatGroup>
    {#if $processing}
        <Loader color="gray"/>
    {:else if $error}
        <ErrorAlert error={$error}/>
    {:else if $dashboardData}
        {#if overdueCount + thisMonthCount > limit}<Text color="dimmed" size="xs" mt="md"> Only showing a maximum of {limit}.</Text>{/if}
        {#await import('svelte-table').then(m=>m.default)}
            <Loader color="gray"/>
        {:then SvelteTable}
                <SvelteTable columns="{columns}" rows={$dashboardData.filter(r=>getDaysLeft(r.next_due_accounts) < 31 && getDaysLeft(r.next_due_accounts) > -7).slice(0,limit)}
                             sortBy="days_left" sortOrder="{1}"
                             rowKey="company_name" classNameTable="accounts-tile-table"
                >
                </SvelteTable>
        {/await}
    {/if}
</div>


<style>

</style>
