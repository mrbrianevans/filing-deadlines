<script lang="ts">

  import {Button, Container,Badge} from "@svelteuidev/core";
  import {SubscriptionPlans} from '../../../fs-shared/SubscriptionPlans.js'
  import {fetcher, poster} from "../lib/swr.js";
  import {navigate} from "svelte-navigator";

  async function startPurchase(plan){
    const {checkoutUrl} = await fetcher('/api/user/org/member/owner/payments/create-session?'+ new URLSearchParams({plan}).toString())
    // redirects the user to checkout on Stripe
    await navigate(checkoutUrl)
  }
</script>

<Container>
    <h1>Pricing
        <Badge>Coming soon</Badge></h1>
    <p>There are different plans available depending on your needs. Plans are billed monthly and you can cancel anytime.</p>
    <div class="pricing-container">
        <div style="border: 2px solid #86d4e0">
            <h2>Basic £5/month</h2>
            <ul>
                <li>accounts dashboard for next 30 days</li>
                <li>confirmation statement dashboard for next 7 days</li>
                <li>recent filings for last 7 days</li>
                <li>only 2 users in organisation</li>
            </ul>
            <div class="buy-button-container">
                <Button on:click={()=>startPurchase(SubscriptionPlans.BASIC)}>Purchase</Button>
            </div>
        </div>
        <div style="background: #c2ebf1">
            <h2>Premium £25/month</h2>
            <Badge color="green">Free 1 month trial</Badge>
            <ul>
                <li>accounts dashboard (full year)</li>
                <li>confirmation statement dashboard (full year)</li>
                <li>recent filings (one year history)</li>
                <li>registered office address checker</li>
                <li>notifications for new filings</li>
                <li>up to 20 users in organisation</li>
            </ul>
            <div class="buy-button-container">
                <Button on:click={()=>startPurchase(SubscriptionPlans.PREMIUM)}>Start trial</Button>
            </div>
        </div>
    </div>

    <p>The plan you purchase is for your organisation. Anyone you invite to your organisation will get the same features.</p>


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

    .buy-button-container{
        display: grid;
        place-items: center;

    }
</style>
