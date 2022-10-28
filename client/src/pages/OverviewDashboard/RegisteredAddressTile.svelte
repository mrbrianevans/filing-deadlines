<script lang="ts">

  import {Badge,Group, Text} from "@svelteuidev/core";
import {swr} from "@svelte-drama/swr";
import {readableSwrOptions} from "../../lib/swr.js";
import {onMount} from "svelte";
import type {RegisteredOfficeAddressStats} from "../../../../fs-shared/OfficeAddress.js";
  import Stat from "../../components/Stat.svelte";


const counts = swr<RegisteredOfficeAddressStats>('/api/user/org/member/registered-address/count', readableSwrOptions)
const {data, error, processing, refresh} = counts
onMount(()=>refresh())
</script>

<div>
    <h2>Registered office address</h2>
    <Group>
        <Stat label="active companies registered at your address"
              description="the total number of active companies registered at your office address"
              data={$data?.totalRegistered} loading={$processing}/>
        <Stat label="companies on your client list"
              description="the number of clients in your client list"
              data={$data?.numberOfClients} loading={$processing}/>
        <Stat label="companies on your client list registered at your address"
              description="the number of companies on your client list who are registered at your office address"
              data={$data?.clientsRegisteredAtOfficeAddress} loading={$processing}/>
    </Group>

    <Text color="dimmed" size="xs" mt="xs">These counts are based on a search at Companies House with your postcode and optionally first line of address, and may not be perfectly accurate.</Text>
</div>


<style>

</style>
