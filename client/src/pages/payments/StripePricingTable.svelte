<script lang="ts">

import {user} from "../../lib/stores/user.js";
</script>

<svelte:head>
    <script async src="https://js.stripe.com/v3/pricing-table.js"></script>
</svelte:head>

<stripe-pricing-table pricing-table-id="prctbl_1LubR6GuSAMsS48JBFCzmcmR"
                      publishable-key="pk_test_51Ls3sdGuSAMsS48JQ2iQosZxPZlruWnFaJUh4einfCFDEzJd1F8ajuQ4HxhT5MdCmgZZnapZFtvpMbsPnKezXgdF00Bdkcf4rv"
                      client-reference-id="{$user.id}"
                      customer-email="{$user.email}"
>
</stripe-pricing-table>
