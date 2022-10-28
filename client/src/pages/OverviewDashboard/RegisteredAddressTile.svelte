<script lang="ts">

  import {Badge, Text} from "@svelteuidev/core";
import {swr} from "@svelte-drama/swr";
import {readableSwrOptions} from "../../lib/swr.js";
import {onMount} from "svelte";
import type {RegisteredOfficeAddressStats} from "../../../../fs-shared/OfficeAddress.js";

const counts = swr<RegisteredOfficeAddressStats>('/api/user/org/member/registered-address/count', readableSwrOptions)
const {data, error, processing, refresh} = counts
onMount(()=>refresh())
</script>

<div>
    <h2>Registered office address</h2>
    <p>Number of active companies registered at your address: {$data?.totalRegistered ?? "?"}</p>
    <p>Number of companies on your client list: {$data?.numberOfClients ?? "?"}</p>
    <p>Number of companies on your client list registered at your address: {$data?.clientsRegisteredAtOfficeAddress ?? "?"}</p>

    <Text color="dimmed" size="xs">These counts are based on a search at Companies House with your postcode and optionally first line of address, and may not be perfectly accurate.</Text>
</div>


<style>

</style>
