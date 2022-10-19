<script lang="ts">

  import {Button, Group, Text, TextInput, Title} from "@svelteuidev/core";
  import {onMount} from "svelte";
  import {orgMembers} from "../../lib/stores/org.js";
  import {user} from "../../lib/stores/user.js";
  import {orgAddress} from "../../lib/stores/orgAddress.js";
  import type {OfficeAddress} from "../../../../fs-shared/OfficeAddress.js";


  let newAddress: OfficeAddress = {postCode: '', addressLine1: ''}
  onMount(async ()=>{
    await Promise.allSettled([orgMembers.refresh(), user.refresh(),orgAddress.refresh()])
    newAddress.addressLine1 = $orgAddress?.addressLine1 ?? ''
    newAddress.postCode = $orgAddress?.postCode ?? ''
    const unsub = orgAddress.subscribe(oa => newAddress = oa ?? {postCode: '', addressLine1: ''})
    return () => unsub()
  })
  let {processing: addressLoading} = orgAddress
</script>

<div>
    <Title order="{3}">Registered office address</Title>
    <Text color="dimmed">This is required for the registered office address features.</Text>
    <Group>
        <TextInput label="Post code" bind:value={newAddress.postCode}/>
        <TextInput label="Address line 1" bind:value={newAddress.addressLine1}/>
        <Button on:click={()=>orgAddress.update(prev=>Object.assign(prev??{}, newAddress))} loading={$addressLoading}>Set address</Button>
    </Group>
</div>


<style>

</style>
