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
    <Title order={2} class="no-top-margin">Registered office address </Title>
<!--    <ActionIcon on:click={refresh}><Reload/></ActionIcon>  this was decided against because the data doesn't update often enough to make it necessary -->
    <p>{$orgAddress?.addressLine1} {$orgAddress?.postCode}. <AnchoredLink href="/secure/registered-office-address">View full list</AnchoredLink></p>
    <StatGroup>
        <Stat label="active companies registered at your address"
              description="the total number of active companies registered at your office address"
              data={$data?.totalRegistered} loading={$processing}/>
        <Stat label="companies on your client list registered at your address"
              description="the number of companies on your client list who are registered at your office address post code"
              data={$data?.clientsRegisteredAtOfficeAddress} loading={$processing}/>
    </StatGroup>

    <Text color="dimmed" size="xs" mt="xs">These counts are based on a search at Companies House with your postcode and optionally first line of address, and may not be perfectly accurate.</Text>
</div>


<style>

</style>
