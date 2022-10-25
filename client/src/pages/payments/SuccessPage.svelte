<script lang="ts">

  import {Badge, Container, Text} from "@svelteuidev/core";
import {onMount} from "svelte";
  import AnchoredLink from "../../components/AnchoredLink.svelte";
import {useLocation} from 'svelte-navigator'
  import {user} from "../../lib/stores/user.js";
  import {fetcher} from "../../lib/swr.js";

  const location = useLocation()
  let status
onMount(()=>{
  // updates user session to have new plan
  fetch('/api/user/org/member/refreshOrgPlan').then(()=>user.refresh())
  const checkoutSessionId = new URLSearchParams($location.search).get('checkoutSessionId')
  fetcher('/api/user/org/member/owner/payments/checkout-session?checkoutSessionId='+checkoutSessionId).then((res)=>{
    status = res.status
  })
})

</script>

<Container>
    <h1>Success!</h1>
    <Text>Your subscription plan has started and your account has been granted permission to all the features included in your plan.</Text>
    <Text>Go to <AnchoredLink href="/secure/manage-organisation">manage organisation</AnchoredLink> to manage your organisation and billing.</Text>
    {#if status} <div>Status: <Badge>{status}</Badge></div> {/if}
</Container>

<style>

</style>
