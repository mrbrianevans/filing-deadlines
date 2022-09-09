<script lang="ts">
    import type {TableColumns} from "svelte-table/src/types.js";
    import {dashboardData} from "../lib/dashboardData.js";
    import type {DashboardDataItem} from '../../../fs-shared/DashboardData.js'
    import {company_type,company_status} from '../assets/constants.json'
    import {ActionIcon, Alert, Anchor, Loader, Text, Tooltip} from "@svelteuidev/core";
    import {InfoCircled, Reload} from "radix-icons-svelte";
    import {user} from "../lib/user.js";
    import {Link} from "svelte-navigator";

    const columns: TableColumns<DashboardDataItem> = [
      {
        key: 'company_number',
        title: 'Registration number',
        value: v => v.company_number
      },
      {
        key: 'company_name',
        title: 'Client name',
        value: v => v.company_name
      },
      {
        key: 'company_status',
        title: 'Company status',
        value: v => company_status[v.company_status]
      },
      {
        key: 'company_type',
        title: 'Company type',
        value: v => company_type[v.company_type]
      },
      {
        key: 'accounting_reference_date',
        title: 'accounting reference date',
        value: v => v.accounting_reference_date.day
      },
      {
        key: 'last_accounts',
        title: 'Last accounts filed',
        value: v => v.last_accounts.made_up_to
      },
      {
        key: 'next_due_accounts',
        title: 'Next accounts due',
        value: v => v.next_due_accounts
      }
    ]

    function getRowClass(row: DashboardDataItem): string{
      // if its overdue, highlight it bright red. If it's in the next week, a bit dimmer, next month a bit dimmer, otherwise none.
      return row.accounting_reference_date.day === 31 ? 'active': 'dissolved'
    }

    let expanded = []
    // expand details on row click
    function handleRowClick(event){
      if(event.detail.row.$expanded) expanded = []
      else expanded = [event.detail.row.company_number]
    }
    const {error, processing} = dashboardData
</script>

<div>
    {#if $user}
    {#await import('svelte-table').then(m=>m.default)}
        <Loader/>
    {:then SvelteTable}
        {#if $processing}

            <Loader />
        {:else if $error}
            <Alert icon={InfoCircled} title="{$error.name}" color="red">
             An error occurred while getting the dashboard data.
            </Alert>
        {:else if $dashboardData?.length > 0}
            <Tooltip label="Reload dashboard" withArrow>
                <ActionIcon on:click={()=>dashboardData.refresh()}><Reload/></ActionIcon>
            </Tooltip>
            <SvelteTable columns="{columns}" rows={$dashboardData}
                         sortBy="next_due_accounts" sortOrder="{1}"
                         rowKey="company_number" classNameRow="{getRowClass}"
                         classNameTable="dashboard-table"
                         expandSingle="{true}"
                         bind:expanded={expanded}
                         on:clickRow="{handleRowClick}"
            >
                <svelte:fragment slot="expanded" let:row><pre>{JSON.stringify(row, null, 2)}</pre></svelte:fragment>
            </SvelteTable>
        {/if}
    {/await}
    {:else}
    <Text>You need to be logged in to view your dashboard. Try "Sign In with Xero" in the top right of this page, or go to the <Anchor root={Link} to="/" inherit>home page</Anchor>.</Text>
    {/if}


</div>

<style lang="scss">

    :global(table.dashboard-table tr.active) {
        background: rgba(186, 220, 88,0.4);
    }

    :global(table.dashboard-table tr.dissolved) {
        background: rgba(235, 77, 75, 0.4)
    }

</style>
