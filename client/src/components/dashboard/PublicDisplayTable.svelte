<script lang="ts">
    import type {TableColumns} from "svelte-table/src/types.js";
    import type {DashboardData, DashboardDataItem} from '../../../../fs-shared/DashboardData.js'
    import CompanyName from "./CompanyName.svelte";
    import CompanyStatus from "./CompanyStatus.svelte";
    import {company_status} from "../../assets/constants.json";
    import {Loader} from "@svelteuidev/core";
    import NextAccountsDueDate from "./NextAccountsDueDate.svelte";
    import NextAccountsMadeUpTo from "./NextAccountsMadeUpTo.svelte";

    function getDaysLeft(date: string){
      return Math.floor((new Date(date) - Date.now())/(86400*1000))
    }
    function getDueDateDuration(dueDate: string|undefined){
      if(!dueDate) return ''
      const days = getDaysLeft(dueDate)
      return days > 0 ? `${days} days left` : `${-days} days ago`
    }
    const columns: TableColumns<DashboardDataItem> = [
      {
        key: 'company_name',
        title: 'Client',
        renderComponent: CompanyName,
        value: v=>v.company_name ?? ''
      },
      {
        key: 'next_accounts_made_up_to',
        title: 'Next accounts made up to',
        value: v => v.next_accounts_made_up_to?? '',
        renderComponent: NextAccountsMadeUpTo
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
        value: v => getDueDateDuration(v.next_due_accounts)
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
    export let data: DashboardData
</script>

<div>
    {#await import('svelte-table').then(m=>m.default)}
        <Loader/>
    {:then SvelteTable}
        <SvelteTable columns="{columns}" rows={data.filter(r=>getDaysLeft(r.next_due_accounts) < 60)}
                     sortBy="next_due_accounts" sortOrder="{1}"
                     rowKey="company_number" classNameRow="{getRowClass}"
                     classNameTable="dashboard-table public"
        >
        </SvelteTable>
    {/await}
</div>


<style lang="scss">

  :global(table.dashboard-table.public td) {
    font-size: 22px;
  }

</style>
