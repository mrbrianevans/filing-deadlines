<script lang="ts">

  import {swr} from "@svelte-drama/swr";
  import {readableSwrOptions} from "../../lib/swr.js";
  import {onMount} from "svelte";
  import Stat from "../../components/Stat.svelte";
  import AnchoredLink from "../../components/AnchoredLink.svelte";

  const counts = swr<number>('/api/user/org/member/client-list/count', readableSwrOptions)
  const {data, error, processing, refresh} = counts
  onMount(()=>refresh())
</script>

<div>
    <h2>Clients</h2>

    <p>You have {$data} clients on your client list. <AnchoredLink href="/secure/clients">View client list</AnchoredLink></p>
    <Stat label="number of clients"
          description="the number of clients on your organisations client list"
          data={$data} loading={$processing}/>
</div>


<style>

</style>
