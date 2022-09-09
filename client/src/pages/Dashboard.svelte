<script lang="ts">
    import type {TableColumns} from "svelte-table/src/types.js";
    import {dashboardData} from "../lib/dashboardData.js";
    import type {DashboardDataItem} from '../../../fs-shared/DashboardData.js'
    import {company_type,company_status} from '../assets/constants.json'
    import {ActionIcon, Alert, Anchor, Container, Loader, Text, Title, Tooltip} from "@svelteuidev/core";
    import {InfoCircled, Reload } from "radix-icons-svelte";
    import {user} from "../lib/user.js";
    import {Link} from "svelte-navigator";
    import CompanyName from "../components/dashboard/CompanyName.svelte";
    import CompanyStatus from "../components/dashboard/CompanyStatus.svelte";
    import CompanyProfile from "../components/dashboard/CompanyProfile.svelte";
    import {onMount} from "svelte";

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
      // {
      //   key: 'accounting_reference_date',
      //   title: 'Accounting reference date',
      //   value: v => v.accounting_reference_date.day + ' ' + shortMonths[v.accounting_reference_date.month-1]
      // },
      {
        key: 'last_accounts',
        title: 'Last accounts filed',
        value: v => v.last_accounts.made_up_to?? ''
      },
      {
        key: 'next_due_accounts',
        title: 'Next accounts due',
        value: v => v.next_due_accounts?? ''
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

    let expanded = []
    // expand details on row click
    function handleRowClick(event){
      if(event.detail.row.$expanded) expanded = []
      else expanded = [event.detail.row.company_number]
    }
    const {error, processing} = dashboardData
    onMount(()=>dashboardData.refresh())
</script>

<div>
    {#if $user}
    {#await import('svelte-table').then(m=>m.default)}
        <Loader/>
    {:then SvelteTable}
        {#if $error}
            <Alert icon={InfoCircled} title="{$error.name}" color="red">
             An error occurred while getting the dashboard data.
            </Alert>
        {:else if $dashboardData}
            {#if $dashboardData.length > 0}
            <Tooltip label="Reload dashboard" withArrow>
                <ActionIcon on:click={()=>dashboardData.refresh()} loading="{$processing}"><Reload/></ActionIcon>
            </Tooltip>
            <SvelteTable columns="{columns}" rows={$dashboardData}
                         sortBy="next_due_accounts" sortOrder="{1}"
                         rowKey="company_number" classNameRow="{getRowClass}"
                         classNameTable="dashboard-table"
                         expandSingle="{true}"
                         bind:expanded={expanded}
                         on:clickRow="{handleRowClick}"
            >
                <svelte:fragment slot="expanded" let:row><CompanyProfile row="{row}"/></svelte:fragment>
            </SvelteTable>
            {:else}
                <Container>
                    <Title order={3}>Get started</Title>
                    <Text>
                        It looks like you haven't added any clients yet.
                        Go the <Anchor root={Link} to="/clients" href="/clients" inherit>client list page</Anchor> and add some clients to get started.
                        Then data will appear in your dashboard.
                    </Text>
                </Container>
            {/if}
        {/if}
    {/await}
    {:else}
    <Text>You need to be logged in to view your dashboard. Try "Sign In with Xero" in the top right of this page, or go to the <Anchor root={Link} to="/" href="/" inherit>home page</Anchor>.</Text>
    {/if}


</div>

<style lang="scss">

  :global(table.dashboard-table tr.overdue) {
    background: rgba(235, 77, 75,0.9);
  }

    :global(table.dashboard-table tr.within-week) {
      background: rgba(235, 77, 75, 0.7)
    }
    :global(table.dashboard-table tr.within-month) {
      background: rgba(235, 77, 75, 0.4)
    }
    :global(table.dashboard-table tr.within-year) {
      background: rgba(235, 77, 75, 0)
    }
    :global(table.dashboard-table tr.more-than-year) {
      background: rgba(186, 220, 88,0.4);
    }

</style>
