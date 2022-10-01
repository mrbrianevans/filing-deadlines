<script lang="ts">

  import {poster} from "../lib/swr.js";
  import {FetchError} from "../lib/swr.js";
  import {Alert, Button, SimpleGrid, Text} from "@svelteuidev/core";
  import {InfoCircled, SewingPinFilled} from "radix-icons-svelte";
  import {onMount} from "svelte";
  import {user} from "../lib/stores/user.js";
  import {navigate,} from "svelte-navigator";
  import AnchoredLink from "./AnchoredLink.svelte";

  export let error: FetchError

  function getErrorJson(e){
    if(e instanceof FetchError) return e.toJSON()
    else if(e instanceof Error) return {name: e.name, message: e.message, stack: e.stack}
  }

  let reporting = false, reported = false, logged = false
  async function reportError(){
    reporting = true
    try{
      reported = await poster('/api/error/report', getErrorJson(error))
    }finally {
      reporting = false
    }
  }
  async function sendError(){
    logged = await poster('/api/error', getErrorJson(error))
  }
  onMount(()=> {
    if(error.statusCode === 401) {
      user.refresh() // get user
      location.reload() // refresh page
    }
    else sendError()
  })
</script>

<Alert icon={InfoCircled} title="Error: {error.name}" color="red">
    <SimpleGrid cols="{2}">
        <div>
            <Text inherit>{error.message}</Text>

            <Text color="dimmed" inherit size="xs">Error code: {error.statusCode??error.code??'UNKNOWN'}</Text>

            {#if logged}<Text color="dimmed" inherit size="xs">This error has been logged on the server.</Text> {/if}

        </div>
        <div>
            <Button color="red" variant="subtle" on:click={reportError} loading="{reporting}" disabled="{reported}">
                <SewingPinFilled slot="leftIcon"/>
                Report error
            </Button>
            <AnchoredLink href="/feedback">Write a feedback report</AnchoredLink>
        </div>
    </SimpleGrid>
</Alert>


<style>

</style>
