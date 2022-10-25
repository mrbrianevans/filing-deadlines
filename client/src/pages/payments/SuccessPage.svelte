<script lang="ts">

  import {Container, Text} from "@svelteuidev/core";
import {onMount} from "svelte";
  import AnchoredLink from "../../components/AnchoredLink.svelte";
import {useLocation} from 'svelte-navigator'
  import {user} from "../../lib/stores/user.js";

  const location = useLocation()
onMount(()=>{
  // updates user session to have new plan
  fetch('/api/user/org/member/refreshOrgPlan').then(()=>user.refresh())
  const checkoutSessionId = new URLSearchParams($location.search).get('checkoutSessionId')
  console.log("Stripe checkout session Id:", checkoutSessionId)
})

</script>

<Container>
    <h1>Payment success</h1>
    <Text>Your subscription plan has started and your account has been granted permission to all the features included in your plan.</Text>
    <Text>Go to <AnchoredLink href="/secure/manage-organisation">manage organisation</AnchoredLink> to manage your organisation.</Text>
</Container>

<style>

</style>
