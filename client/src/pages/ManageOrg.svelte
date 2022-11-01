<script lang="ts">

import {user} from "../lib/stores/user.js";
import {Badge, Button, Container, Group, Text, Title, Tooltip} from "@svelteuidev/core";
import CreateOrganisation from "./org/CreateOrganisation.svelte";
import StripePricingTable from "./payments/StripePricingTable.svelte";
import EditRegisteredAddress from "../components/manageOrg/EditRegisteredAddress.svelte";
import ManageOrgMembers from "../components/manageOrg/ManageOrgMembers.svelte";
import {fetcher} from "../lib/swr.js";
import {navigate} from "svelte-navigator";
import {orgSubscription} from "../lib/stores/org.js";
import Stat from "../components/Stat.svelte";
import {sentenceCase} from "sentence-case";

let redirecting = false
$: if($user?.orgPlan && $user?.owner) orgSubscription.refresh()
const {processing:subscriptionLoading} = orgSubscription
</script>

<Container>
    <Title order={2}>Manage organisation</Title>
    <Group spacing="xl" mb="xl">
        <Stat label="Organisation" data={$user.orgName} defaultValue="no organisation"
              description="The name of your organisation."
              red={!$user.orgName}
        />
        <Stat label="Subscription status" data={$user.orgPlan} defaultValue="no subscription plan"
              formatter={d=>sentenceCase(d)}
              description="The subscription plan of your organisation determines which features you can use."
              red={!$user.orgPlan}
        />
        {#if $user.orgPlan && $user.owner && $orgSubscription}
            <Stat label="Subscription status" data={$orgSubscription?.status}
                  formatter={d=>sentenceCase(d)}
                  description="The status of your organisations subscription."
                  red={$orgSubscription?.status !== 'active'} loading={$subscriptionLoading}
            />
                {#if $orgSubscription}
                    <Stat label="Subscription lasts until" data={$orgSubscription.activeUntil}
                          formatter={d=>new Date(d).toLocaleDateString()}
                          description="Your current subscription lasts until this date. This renews whenever you get billed."
                          red={new Date($orgSubscription.activeUntil).getTime() - Date.now() < 0} loading={$subscriptionLoading}
                    />
                {/if}
                {#if $orgSubscription?.signedUpOnStripe}
                    <Button loading={redirecting} on:click={async () => {
                        redirecting = true
                    const {portalUrl} = await fetcher('/api/user/org/member/owner/payments/portal-url')
                        navigate(portalUrl) // redirect user to stripe
                    }}>Manage billing</Button>
                {/if}
        {/if}
    </Group>
    {#if $user.orgName}
        {#if $user.orgPlan}
            {#if $user?.owner && $orgSubscription?.signedUpOnStripe === false}
                <Title order={3}>Choose a subscription plan</Title>
                <!--    the user is the owner of an organisation which has not subscribed to a plan, show the pricing table -->
                <StripePricingTable/>
            {/if}
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

