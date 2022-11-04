<script lang="ts">

  import {ActionIcon, Text, Title} from "@svelteuidev/core";
import {swr} from "@svelte-drama/swr";
import {readableSwrOptions} from "../../lib/swr.js";
import {onMount} from "svelte";
  import type {RegisteredOfficeAddressStats} from "../../../../fs-shared/OfficeAddress.js";
  import Stat from "../../components/Stat.svelte";
  import {orgAddress} from "../../lib/stores/orgAddress.js";
  import AnchoredLink from "../../components/AnchoredLink.svelte";
  import StatGroup from "../../components/StatGroup.svelte";
  import {Reload} from "radix-icons-svelte";


const counts = swr<RegisteredOfficeAddressStats>('/api/user/org/member/registered-address/count', readableSwrOptions)
const {data, error, processing, refresh} = counts
onMount(()=>refresh())
</script>

<div>
<!--    todo: show something different if the user doesn't have access to registered address -->
    <StatGroup>
        <Stat label="active companies registered at your address"
              description="the total number of active companies registered at your office address"
              data={$data?.totalRegistered} loading={$processing}/>
        <Stat label="companies on your client list registered at your address"
              description="the number of companies on your client list who are registered at your office address post code"
              data={$data?.clientsRegisteredAtOfficeAddress} loading={$processing}/>
    </StatGroup>
</div>


<style>

</style>
