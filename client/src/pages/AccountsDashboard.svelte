<script lang="ts">
  import {dashboardData} from "../lib/stores/dashboardData.js";
  import {ActionIcon, Alert, Anchor, Container, Group, Switch, Text, Title, Tooltip} from "@svelteuidev/core";
  import {InfoCircled, Reload} from "radix-icons-svelte";
  import {user} from "../lib/stores/user.js";
  import {Link} from "svelte-navigator";
  import {onMount} from "svelte";
  import PublicDisplayTable from "../components/dashboard/PublicDisplayTable.svelte";
  import DesktopDisplayTable from "../components/dashboard/DesktopDisplayTable.svelte";
    import rowHighlights from '../components/dashboard/rowHighlights.css'
  import AnchoredLink from "../components/AnchoredLink.svelte";
  import AsyncDuration from "../components/AsyncDuration.svelte";
  import {features} from "../lib/stores/features.js";
  import {clientList} from "../lib/stores/clientList.js";

  let publicView = false

    const {error, processing} = dashboardData
    onMount(()=>dashboardData.refresh())
</script>

<div>
        {#if $error}
            <Alert icon={InfoCircled} title="{$error.name}" color="red">
             An error occurred while getting the dashboard data.
            </Alert>
        {:else if $dashboardData}
            <Group>
                <Text>Accounts</Text>
                <Tooltip label="Reload dashboard" withArrow>
                    <ActionIcon on:click={()=>dashboardData.refresh()} loading="{$processing}"><Reload/></ActionIcon>
                </Tooltip>
                <Switch label="Public display view" bind:checked={publicView}/>
            </Group>
            <Text>Showing the next {publicView?Math.min($features.accountsDashboardMaxPeriodMonths, 2):$features.accountsDashboardMaxPeriodMonths} month(s) of data.</Text>
            {#if $dashboardData.length > 0}
            <svelte:component this={publicView?PublicDisplayTable:DesktopDisplayTable} data={$dashboardData}/>
            {:else}
                <Container>
                    {#if $clientList?.length > 0}
                        <Title order={3}>All done!</Title>
                        <Text>
                            You don't have any accounts deadlines in the next {$features.accountsDashboardMaxPeriodMonths} month(s).
                        </Text>
                    {:else }
                    <Title order={3}>Get started</Title>
                    <Text>
                        It looks like you haven't added any clients yet.
                        Go the <AnchoredLink href="/secure/clients">client list page</AnchoredLink> and add some clients to get started.
                        Then data will appear in your dashboard.
                    </Text>
                    {/if}
                </Container>
            {/if}
        {/if}
</div>

<style src="{rowHighlights}"></style>
