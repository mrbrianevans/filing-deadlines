<script lang="ts">
  import {dashboardData} from "../lib/stores/dashboardData.js";
  import {ActionIcon, Alert, Anchor, Container, Group, Switch, Text, Title, Tooltip} from "@svelteuidev/core";
  import {InfoCircled, Reload} from "radix-icons-svelte";
  import {user} from "../lib/stores/user.js";
  import {Link} from "svelte-navigator";
  import {onMount} from "svelte";
  import PublicDisplayTable from "../components/dashboard/PublicDisplayTable.svelte";
  import DesktopDisplayTable from "../components/dashboard/DesktopDisplayTable.svelte";


  let publicView = false

    const {error, processing} = dashboardData
    onMount(()=>dashboardData.refresh())
</script>

<div>
    {#if $user}
        {#if $error}
            <Alert icon={InfoCircled} title="{$error.name}" color="red">
             An error occurred while getting the dashboard data.
            </Alert>
        {:else if $dashboardData}
            {#if $dashboardData.length > 0}
                <Group>
                    <Tooltip label="Reload dashboard" withArrow>
                        <ActionIcon on:click={()=>dashboardData.refresh()} loading="{$processing}"><Reload/></ActionIcon>
                    </Tooltip>
                    <Switch label="Public display view" bind:checked={publicView}/>
                </Group>
            <svelte:component this={publicView?PublicDisplayTable:DesktopDisplayTable} data={$dashboardData}/>
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
      background: rgba(235, 77, 75, 0.2)
    }
    :global(table.dashboard-table tr.within-year) {
      background: rgba(235, 77, 75, 0)
    }
    :global(table.dashboard-table tr.more-than-year) {
      background: rgba(186, 220, 88,0.4);
    }

</style>
