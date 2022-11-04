<script lang="ts">

import {confirmationStatements} from "../../lib/stores/confirmationStatements.js";
import {getDaysLeftDuration,getDaysLeft} from '../../../../fs-shared/dates.js'
import {Loader, Text, Title} from "@svelteuidev/core";
import {onMount} from "svelte";
import type {TableColumns} from "svelte-table/src/types.js";
import CompanyName from "../../components/dashboard/CompanyName.svelte";
import type {
  ConfirmationStatementItem
} from '../../../../fs-shared/ConfirmationStatements.js'
import AnchoredLink from "../../components/AnchoredLink.svelte";
import ErrorAlert from "../../components/ErrorAlert.svelte";
import Stat from "../../components/Stat.svelte";
import StatGroup from "../../components/StatGroup.svelte";


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
export let limit = 5
$: overdueCount = $confirmationStatements?.filter(r=>getDaysLeft(r.confirmation_statement?.next_due) < 0).length??0
$: thisFortnightCount = $confirmationStatements?.filter(r=> {
  const daysLeft = getDaysLeft(r.confirmation_statement?.next_due)
  return daysLeft >= 0 && daysLeft < 14
}).length??0

</script>

<div>
    <StatGroup>
        <Stat
                label="Overdue" description="Number of your clients whose confirmation statements are overdue"
                data={overdueCount} red={Boolean(overdueCount)}
                loading={$processing}
        />
        <Stat
            label="Due in 14 days" description="Number of your clients whose confirmation statements due within the next fortnight"
            data={thisFortnightCount}
            loading={$processing}
        />
    </StatGroup>
    {#if $processing}
        <Loader color="gray"/>
    {:else if $error}
        <ErrorAlert error={$error}/>
    {:else if $confirmationStatements}
        {#if overdueCount + thisFortnightCount > limit}<Text color="dimmed" size="xs" mt="md"> Only showing {limit} out of {overdueCount + thisFortnightCount}.</Text>{/if}
        {#await import('svelte-table').then(m=>m.default)}
            <Loader color="gray"/>
        {:then SvelteTable}
                <SvelteTable columns="{columns}" rows={$confirmationStatements.filter(r=>getDaysLeft(r.confirmation_statement?.next_due) < 14).slice(0,limit)}
                             sortBy="days_left" sortOrder="{1}"
                             rowKey="company_name"
                >
                </SvelteTable>
        {/await}
    {/if}
</div>


<style>
</style>
