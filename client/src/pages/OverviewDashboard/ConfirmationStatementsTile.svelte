<script lang="ts">

import {confirmationStatements} from "../../lib/stores/confirmationStatements.js";
import {getDaysLeftDuration,getDaysLeft} from '../../../../fs-shared/dates.js'
import {Loader} from "@svelteuidev/core";
import {onMount} from "svelte";
import type {TableColumns} from "svelte-table/src/types.js";
import CompanyName from "../../components/dashboard/CompanyName.svelte";
import type {
  ConfirmationStatementItem
} from '../../../../fs-shared/ConfirmationStatements.js'
import AnchoredLink from "../../components/AnchoredLink.svelte";


const {error, processing} = confirmationStatements
onMount(()=>confirmationStatements.refresh())

const columns: TableColumns<ConfirmationStatementItem> = [
      {
        key: 'company_name',
        title: 'Client',
        renderComponent: CompanyName,
        value: v=>v.company_name ?? ''
      },
      {
        key: 'days_left',
        title: 'Due date',
        value: v => getDaysLeftDuration(v.confirmation_statement?.next_due)
      }
]
const limit = 5
$: overdueCount = $confirmationStatements.filter(r=>getDaysLeft(r.confirmation_statement?.next_due) < 0).length
$: thisFortnightCount = $confirmationStatements.filter(r=> {
  const daysLeft = getDaysLeft(r.confirmation_statement?.next_due)
  return daysLeft >= 0 && daysLeft < 14
}).length

</script>

<div>
    <h2>Confirmation statement deadlines</h2>
    <p>Upcoming confirmation statement deadlines for your clients. <AnchoredLink href="/secure/confirmation-statement-dashboard">View full dashboard</AnchoredLink></p>
    <p>{overdueCount} overdue, {thisFortnightCount} due within a fortnight. {#if overdueCount + thisFortnightCount > limit} Only showing {limit}.{/if}</p>
    {#await import('svelte-table').then(m=>m.default)}
        <Loader/>
    {:then SvelteTable}
        {#if $confirmationStatements}
            <SvelteTable columns="{columns}" rows={$confirmationStatements.filter(r=>getDaysLeft(r.confirmation_statement?.next_due) < 14).slice(0,limit)}
                         sortBy="days_left" sortOrder="{1}"
                         rowKey="company_name"
            >
            </SvelteTable>
        {:else}
            <Loader/>
        {/if}
    {/await}
</div>


<style>

</style>
