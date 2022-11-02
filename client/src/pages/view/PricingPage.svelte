<script lang="ts">

  import {Container, Badge} from "@svelteuidev/core";
  import {user} from "../../lib/stores/user.js";
  import AnchoredLink from "../../components/AnchoredLink.svelte";

</script>


<Container>
    <h1>Pricing
        <Badge>Beta</Badge></h1>
    <p>There are different plans available depending on your needs. Plans are billed monthly and you can cancel anytime.</p>
    <div class="pricing-container">
        <div style="border: 2px solid #86d4e0">
            <h2>Basic £5/month</h2>
            <ul>
                <li>accounts dashboard for next 30 days</li>
                <li>confirmation statement dashboard for next 7 days</li>
                <li>recent filings for last 7 days</li>
                <li>only 2 users in organisation</li>
                <li>up to 100 clients</li>
            </ul>
        </div>
        <div style="background: #c2ebf1">
            <h2>Standard £25/month</h2>
            <Badge color="green">Free 1 month trial</Badge>
            <ul>
                <li>accounts dashboard (full year)</li>
                <li>confirmation statement dashboard (full year)</li>
                <li>recent filings (one year history)</li>
                <li>registered office address checker</li>
                <li>notifications for new filings</li>
                <li>up to 20 users in organisation</li>
                <li>up to 500 clients</li>
            </ul>
        </div>
    </div>

    <p>The plan you purchase is for your organisation. </p>

<!--    this message could be customised based on whether the user is logged in, a member or owner of an organisation. -->
    <p>If you wish to purchase a plan, login and then create an organisation. You will then be able to choose which plan to subscribe to.</p>

    {#if $user}

        {#if $user.orgPlan}
            <p>Your organisation is on <Badge>{$user.orgPlan}</Badge></p>
        {:else}
            <p>To start one of these subscription plans for your organisation, go to <AnchoredLink href="/secure/manage-organisation">manage organisation</AnchoredLink></p>
        {/if}

    {:else}
        <p>It's necessary to sign in before you can start a subscription plan. </p>
    {/if}

</Container>


<style>

    .pricing-container{
        display: grid;
        gap: 1rem;
        grid-template-columns: 1fr 1fr;
    }
    .pricing-container>div{
        border-radius: VAR(--svelteui-radii-md);
        padding: 1rem;
    }

</style>
