<script lang="ts">
  import type {TableColumns} from "svelte-table/src/types.js";
  import type {DashboardDataItem,DashboardData} from '../../../../fs-shared/DashboardData.js'
  import {getDaysLeft, getDaysLeftDuration} from '../../../../fs-shared/dates.js'
  import {company_status, company_type} from '../../assets/constants.json'
  import {Loader} from "@svelteuidev/core";
  import CompanyName from "../../components/dashboard/CompanyName.svelte";
  import CompanyStatus from "../../components/dashboard/CompanyStatus.svelte";
  import CompanyProfile from "../../components/dashboard/CompanyProfile.svelte";
  import NextAccountsDueDate from "./NextAccountsDueDate.svelte";
  import LastAccountsDate from "./LastAccountsDate.svelte";


  const columns: TableColumns<DashboardDataItem> = [
      {
        key: 'company_name',
        title: 'Client',
        renderComponent: CompanyName,
        value: v=>v.company_name ?? ''
      },
      {
        key: 'company_status',
        title: 'Company status',
        renderComponent: CompanyStatus,
        value: v => company_status[v.company_status]?? ''
      },
      {
        key: 'company_type',
        title: 'Company type',
        value: v => company_type[v.company_type]?? ''
      },
      {
        key: 'last_accounts',
        title: 'Last accounts made up to',
        value: v => v.last_accounts.made_up_to?? '',
        renderComponent: LastAccountsDate
      },
      {
        key: 'next_due_accounts',
        title: 'Next accounts due',
        value: v => v.next_due_accounts?? '',
        renderComponent: NextAccountsDueDate
      },
      {
        key: 'days_left',
        title: 'Due date',
        value: v => getDaysLeftDuration(v.next_due_accounts)
      }
    ]

    function getRowClass(row: DashboardDataItem): string{
      // if its overdue, highlight it bright red. If it's in the next week, a bit dimmer, next month a bit dimmer, otherwise none.
      const daysLeft = getDaysLeft(row.next_due_accounts)
      if(daysLeft < 0) return 'overdue'
      else if(daysLeft < 7) return 'within-week'
      else if(daysLeft < 30) return 'within-month'
      else if(daysLeft < 365) return 'within-year'
      else return 'more-than-year'
    }

    let expanded = []
    // expand details on row click
    function handleRowClick(event){
      if(event.detail.row.$expanded) expanded = []
      else expanded = [event.detail.row.company_number]
    }
  export let data: DashboardData
</script>

<div>
    {#await import('svelte-table').then(m=>m.default)}
        <Loader/>
    {:then SvelteTable}
        <SvelteTable columns="{columns}" rows={data}
                     sortBy="next_due_accounts" sortOrder="{1}"
                     rowKey="company_number" classNameRow="{getRowClass}"
                     classNameTable="dashboard-table"
                     expandSingle="{true}"
                     bind:expanded={expanded}
                     on:clickRow="{handleRowClick}"
        >
            <svelte:fragment slot="expanded" let:row><CompanyProfile row="{row}"/></svelte:fragment>
        </SvelteTable>
    {/await}


</div>

<style lang="scss">


</style>
