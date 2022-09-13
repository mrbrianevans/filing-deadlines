<script lang="ts">

    // if data is loading, show loading message and set refresh button to loader animation
    // if data is error, show error alert
    // if data has loaded, but is empty, show message directing the user to client list
    // if data is present, async load SvelteTab and show dashboard

    import {onMount} from "svelte";
    import {confirmationStatements} from "../lib/stores/confirmationStatements.js";
    import {ActionIcon, Alert, Anchor, Group, Loader, Text, Tooltip} from "@svelteuidev/core";
    import {InfoCircled, Reload} from "radix-icons-svelte";
    import type {TableColumns} from "svelte-table/src/types.js";
    import {Link} from "svelte-navigator";
    import CompanyName from "../components/dashboard/CompanyName.svelte";
    import CompanyStatus from "../components/dashboard/CompanyStatus.svelte";
    import {company_status, company_type} from "../assets/constants.json";
    import NextAccountsMadeUpTo from "../components/dashboard/NextAccountsMadeUpTo.svelte";
    import NextAccountsDueDate from "../components/dashboard/NextAccountsDueDate.svelte";
    import LastAccountsDate from "../components/dashboard/LastAccountsDate.svelte";
    import AsyncDate from "../components/AsyncDate.svelte";
    import {getDaysLeft, getDaysLeftDuration} from '../../../fs-shared/dates.js'
    import type {
      ConfirmationStatementItem
    } from '../../../fs-shared/ConfirmationStatements.js'
    import CompanyNumber from "../components/dashboard/CompanyNumber.svelte";
    import CompanyProfile from "../components/dashboard/CompanyProfile.svelte";
    import AsyncCompanyProfile from "../components/dashboard/AsyncCompanyProfile.svelte";
    import rowHighlights from '../components/dashboard/rowHighlights.css'

    const {error, processing} = confirmationStatements
    onMount(()=>confirmationStatements.refresh())
    const columns: TableColumns<ConfirmationStatementItem> = [
      {
        key: 'company_number',
        title: "Company number",
        value: row => row.company_number,
        renderComponent: CompanyNumber,
      },
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
        key: 'next_statement_made_up_to',
        title: 'Next confirmation statement made up to',
        value: v => v.confirmation_statement?.next_made_up_to?? '',
        renderComponent: {
          component: AsyncDate,
          props: {valueGetter: v => v.confirmation_statement?.next_made_up_to}
        }
      },
      {
        key: 'next_statement_due',
        title: 'Next confirmation statement due',
        value: v => v.confirmation_statement?.next_due?? '',
        renderComponent: {
          component: AsyncDate,
          props: {valueGetter: v => v.confirmation_statement?.next_due}
        }
      },
      {
        key: 'days_left',
        title: 'Due date',
        value: v => getDaysLeftDuration(v.confirmation_statement?.next_due)
      },
      {
        key: 'last_accounts',
        title: 'Last confirmation statement made up to',
        value: v => v.confirmation_statement?.last_made_up_to?? '',
        renderComponent: {
          component: AsyncDate,
          props: {valueGetter: v => v.confirmation_statement?.last_made_up_to}
        }
      }
    ]

    function getRowClass(row: ConfirmationStatementItem): string{
      // if its overdue, highlight it bright red. If it's in the next week, a bit dimmer, next month a bit dimmer, otherwise none.
      const daysLeft = getDaysLeft(row.confirmation_statement?.next_due)
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
</script>

<div>
    <Group>
        <Tooltip label="Reload dashboard" withArrow>
            <ActionIcon on:click={()=>confirmationStatements.refresh()} loading="{$processing}"><Reload/></ActionIcon>
        </Tooltip>
    </Group>
    {#if $error}
        <Alert icon={InfoCircled} title="{$error.name}" color="red">
            An error occurred while getting the dashboard data.
        </Alert>
    {:else if $confirmationStatements}
        {#if $confirmationStatements.length === 0}
            <Text>
                You haven't added any clients yet, so your dashboard is empty.
                Go the <Anchor root={Link} to="/clients" href="/clients" inherit>client list page</Anchor> and add some clients to get started.
                Then data will appear in your dashboard.
            </Text>
        {:else}
            {#await import('svelte-table').then(m=>m.default)}
                <Loader/>
            {:then SvelteTable}
                <SvelteTable columns="{columns}" rows={$confirmationStatements}
                             sortBy="next_due_accounts" sortOrder="{1}"
                             rowKey="company_number" classNameRow="{getRowClass}"
                             classNameTable="dashboard-table"
                             expandSingle="{true}"
                             bind:expanded={expanded}
                             on:clickRow="{handleRowClick}">
                    <svelte:fragment slot="expanded" let:row><AsyncCompanyProfile companyNumber="{row.company_number}"/></svelte:fragment>
                </SvelteTable>
            {/await}
        {/if}
    {:else}
        <Text>Loading confirmation statement dashboard data. Try refreshing the page if it doesn't load soon.</Text>
    {/if}
</div>


<style src="{rowHighlights}"></style>
