<script lang="ts">

  import {
    Button,
    Container,
    Group,
    Loader,
    Text,
    TextInput,
    Title,
    Checkbox,
    Space,
    Tooltip,
    Switch
  } from "@svelteuidev/core";
  import {onMount} from "svelte";
  import {companiesAtAddress, orgAddress} from "../lib/stores/orgAddress.js";
  import ErrorAlert from "../components/ErrorAlert.svelte";
  import OfficeAddressResultsTable from "../components/registeredOfficeAddress/OfficeAddressResultsTable.svelte";
  import {exportRegisteredOfficeAddressXlsx} from "../lib/exportFormats/exportRegisteredOfficeAddressXlsx.js";

  const {error: addressError, processing: addressLoading} = orgAddress
  const {error: companiesAtAddressError, processing: companiesAtAddressLoading} = companiesAtAddress
  onMount(()=>orgAddress.refresh())
  let newAddress = {postCode: '', addressLine1: ''}
  $: if($orgAddress) companiesAtAddress.refresh()
  let showDissolved = false

  $: visibleData = $companiesAtAddress?.filter(c=>showDissolved || c.company_status === 'active')
</script>

<Container size="xl">
    <Title order={2}>Registered office address</Title>

    {#if $orgAddress}
        {#if visibleData}
            <Text>Showing {visibleData.length??''} {showDissolved?'':'active'} companies whose registered office address is {$orgAddress.addressLine1?($orgAddress.addressLine1+', '):''} {$orgAddress.postCode}.</Text>
            <Space h="xs"/>
            <Group>
                <Tooltip label="Feature not available yet">
                    <Checkbox disabled label="Show results which aren't in client list"></Checkbox>
                </Tooltip>
                <Tooltip label="Include dissolved companies in the list">
                    <Checkbox bind:checked={showDissolved} label="Show dissolved"></Checkbox>
                </Tooltip>
                <Tooltip label="Feature not available yet">
                    <Button disabled>Export to CSV</Button>
                </Tooltip>
                <Tooltip label="Export the table to an Excel spreadsheet">
                    <Button color="green" on:click={()=>exportRegisteredOfficeAddressXlsx(visibleData)}>Export to XLSX</Button>
                </Tooltip>
            </Group>
            <OfficeAddressResultsTable data={visibleData} />
        {:else if $companiesAtAddressLoading}
            <Loader/>
        {:else if $companiesAtAddressError}
            <ErrorAlert error="{$companiesAtAddressError}"/>
        {/if}
    {:else if $orgAddress === null}
        <Text>You need to add an address for your organisation to use this feature.</Text>
        <Group>
            <TextInput label="Post code" bind:value={newAddress.postCode}/>
            <TextInput label="Address line 1" bind:value={newAddress.addressLine1}/>
            <Button on:click={()=>orgAddress.update(prev=>Object.assign(prev??{}, newAddress))}>Set address</Button>
        </Group>
    {:else if $addressLoading}
        <Loader/>
    {:else if $addressError}
        <ErrorAlert error="{$addressError}"/>
    {/if}

</Container>

<style>

</style>
