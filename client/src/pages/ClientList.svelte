<script lang="ts">
  import {
    Box,
    Button,
    CloseButton,
    Container,
    Divider,
    Group,
    InputWrapper, Space,
    Text,
    TextInput,
    Tooltip
  } from "@svelteuidev/core";
// import SvelteTable from "svelte-table";
// import {Temporal} from '@js-temporal/polyfill'
import type {TableColumns} from "svelte-table/src/types.js";
import type {ClientListItem} from "../../../fs-shared/ClientList.js";
import {clientList, importClientListCsv} from "../lib/clientList.js";
import FileUpload from 'sveltefileuploadcomponent';
  import { Loader } from '@svelteuidev/core';
  import RemoveClientButton from "../components/clientList/RemoveClientButton.svelte";
  import {FilePlus} from "radix-icons-svelte";



  const columns: TableColumns<ClientListItem> = [
  {
    key: 'company_number',
    title: "Registration number",
    value: v => v.company_number,
  },
  {
    key: 'company_name',
    title: "Client name",
    value: v => v.company_name,
    sortable: true
  },
  {
    key: 'added_on',
    title: "Added on",
    value: v => v.added_on, // this needs to be formatted with Temporal, but Temporal MUST be imported dynamically
  },
  {
    key: 'remove',
    title: "Remove",
    value: v => v.company_number,
    renderComponent: RemoveClientButton
  }
];
let addedCompanyNumber = ''
async function addClient(){
    const newCompanyNumber = addedCompanyNumber
    addedCompanyNumber = ''
    await clientList.addNew(newCompanyNumber)
}

</script>


<Container>
    <h2>Client list</h2>
    <Group>
        <TextInput bind:value={addedCompanyNumber} placeholder="Company number"/>
        <Button on:click={addClient}>Add</Button>
        <Box css={{ height: '2em', display: 'flex', justifyContent: 'center' }}>
            <Divider orientation='vertical' />
        </Box>
        <Tooltip withArrow opened position="right" label="Upload CSV of clients">
            <FileUpload let:dragging multiple={false} on:input={e=>importClientListCsv(e.detail.files)}>
                <Box root="span" css={{border: '1px dashed black', display: 'flex', gap: '1ch', padding: '5px'}}>
                    <FilePlus/>
                    <Text>Drag and Drop or </Text>
                    <Text underline>Browse</Text>
                </Box>
            </FileUpload>
        </Tooltip>
    </Group>
    {#await import('svelte-table').then(m=>m.default)}
        <Loader/>
        {:then SvelteTable}
        {#if $clientList?.length > 0}
            <Space h="md"/>
            <Text>{$clientList.length} clients</Text>
            <SvelteTable columns="{columns}" rows={$clientList}></SvelteTable>
        {/if}
    {/await}
</Container>


<style>

</style>
