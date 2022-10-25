<script lang="ts">

import {user} from "../lib/stores/user.js";
import {Badge, Button, Container, Group, Text, Title, Tooltip} from "@svelteuidev/core";
import CreateOrganisation from "./org/CreateOrganisation.svelte";
import StripePricingTable from "./payments/StripePricingTable.svelte";
import EditRegisteredAddress from "../components/manageOrg/EditRegisteredAddress.svelte";
import ManageOrgMembers from "../components/manageOrg/ManageOrgMembers.svelte";
import {fetcher} from "../lib/swr.js";
import {navigate} from "svelte-navigator";

</script>

<Container>
    <Title order={2}>Manage organisation</Title>
    <Group spacing="xl" mb="xl">
        <Tooltip label="The name of your organisation" openDelay={200}>
            <Badge size="xl" color={$user.orgName?'green':'gray'} radius="xs">{$user.orgName ?? 'no organisation'}</Badge>
        </Tooltip>
        <Tooltip label="The subscription plan of your organisation determines which features you can use." openDelay={200}>
            <Badge size="xl" color={$user.orgPlan?'green':'gray'} radius="xs">{$user.orgPlan ?? 'no subscription plan'}</Badge>
        </Tooltip>
        {#if $user.orgPlan && $user.owner}
            <Button on:click={async () => {
                const {portalUrl} = await fetcher('/api/user/org/member/owner/payments/portal-url')
                navigate(portalUrl) // redirect user to stripe
            }}>Manage billing</Button>
        {/if}
    </Group>
    {#if $user.orgName}
        {#if $user.orgPlan}
        <!--    the user is in an organisation which has an active plan, show them the appropriate features -->
            <EditRegisteredAddress/>
            <ManageOrgMembers/>
        {:else if $user.owner}
        <!--    the user is the owner of an organisation which has not subscribed to a plan, show the pricing table -->
            <StripePricingTable/>
        {:else}
            <Text>Your organisation has not subscribed to a plan. Ask the person who created your organisation on Filing Deadlines to subscribe to a plan. Once they've done that, you'll get access to features.</Text>
        {/if}
    {:else}
        <CreateOrganisation/>
    {/if}
</Container>

