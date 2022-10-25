<script lang="ts">

import {user} from "../../lib/stores/user.js";
import {stripe} from "../../lib/stores/stripe.js";
import AnchoredLink from "../../components/AnchoredLink.svelte";

const {error, processing} = stripe
</script>

<svelte:head>
    <script async src="https://js.stripe.com/v3/pricing-table.js"></script>
</svelte:head>

{#if $stripe}
    <stripe-pricing-table pricing-table-id="{$stripe.pricingTableId}"
                          publishable-key="{$stripe.stripePublicKey}"
                          client-reference-id="{$user.id}"
                          customer-email="{$user.email}"
    >
    </stripe-pricing-table>

{:else if $processing}
    <p>Pricing table loading...</p>
{:else if $error}
    <p>Error loading pricing table. Please see the <AnchoredLink href="/view/pricing">pricing page</AnchoredLink>.</p>
{/if}
