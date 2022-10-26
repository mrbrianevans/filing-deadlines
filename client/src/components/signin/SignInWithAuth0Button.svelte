<script lang="ts">

  import {Button} from "@svelteuidev/core";
  import {EnvelopeClosed} from 'radix-icons-svelte'
</script>

<Button href="/api/sign-in/auth0" ripple variant="light">
    <EnvelopeClosed slot="leftIcon"/>
    Sign in with email
</Button>

<style>

</style>
