<script lang="ts">
  import {
    ActionIcon,
    Alert,
    Anchor,
    Box,
    Button, Center,
    CloseButton,
    Container,
    Divider,
    Group, Image,
    InputWrapper, SimpleGrid, Space,
    Text,
    TextInput, Title,
    Tooltip
  } from "@svelteuidev/core";
import type {TableColumns} from "svelte-table/src/types.js";
import type {ClientListItem} from "../../../fs-shared/ClientList.js";
import {clientList, importClientListCsv} from "../lib/stores/clientList.js";
import FileUpload from 'sveltefileuploadcomponent';
  import { Loader } from '@svelteuidev/core';
  import RemoveClientButton from "../components/clientList/RemoveClientButton.svelte";
  import {FilePlus, InfoCircled, Reload, Trash, Update} from "radix-icons-svelte";
  import {user} from "../lib/stores/user.js";
  import {Link} from "svelte-navigator";
import sampleSpreadsheet from '../assets/sample-spreadsheet.png'
  import SampleSpreadsheet from "../components/clientList/SampleSpreadsheet.svelte";
  import {onMount} from "svelte";
  import AddedOn from "../components/clientList/AddedOn.svelte";
  import CompanyStatus from "../components/dashboard/CompanyStatus.svelte";
  import {company_status} from "../assets/constants.json";
  import CompanyNumber from "../components/dashboard/CompanyNumber.svelte";
  import ErrorAlert from "../components/ErrorAlert.svelte";
  import {features} from "../lib/stores/features.js";


const columns: TableColumns<ClientListItem> = [
  {
    key: 'company_number',
    title: "Company number",
    value: v => v.company_number,
    renderComponent: CompanyNumber
  },
  {
    key: 'company_name',
    title: "Client name",
    value: v => v.company_name??'',
    sortable: true
  },
    {
      key: 'company_status',
      title: 'Company status',
      renderComponent: CompanyStatus,
      value: v => company_status[v.company_status]?? '',
      sortable: true,
    },
  // {
  //   key: 'added_on',
  //   title: "Updated on",
  //   value: v => new Date(v.added_on).getTime().toString(),
  //   renderComponent: AddedOn
  // },
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
let {processing, error} = clientList
  onMount(()=>clientList.refresh())
  let reloading = false
  async function reloadClientListDetails(){
  reloading = true
    await fetch('/api/user/org/member/client-list/reloadDetails')
    await clientList.refresh() // when request has returned, the list has been updated on the server, so refresh it here
    reloading = false
  }
  $: addingNewClientsDisabled = $clientList?.length >= $features?.clientListMaxSize
  let removingAll = false
  let uploading = false
  async function uploadCsv(csv){
    uploading = true
    await importClientListCsv(csv)
    uploading = false
  }
</script>


<Container>
    <Title order={2}>Client list</Title>
    {#if $user}
    <Group>
        <TextInput bind:value={addedCompanyNumber} placeholder="Company number" disabled={addingNewClientsDisabled}/>
        <Button on:click={addClient} disabled={addingNewClientsDisabled}>Add</Button>
        <Box css={{ height: '2em', display: 'flex', justifyContent: 'center' }}>
            <Divider orientation='vertical' />
        </Box>
        {#if addingNewClientsDisabled}
            <Text>You have reached the maximum number of clients included in your subscription.</Text>
        {:else}
                <InputWrapper label="Upload CSV of clients">
                <FileUpload let:dragging multiple={false} on:input={e=>uploadCsv(e.detail.files)}>
<!--             TODO:       apply custom styling based on dragging variable. probably best to replace this Box with a div -->
                    <Box root="span" css={{border: dragging? '1px solid currentColor':'1px dashed currentColor', display: 'flex', gap: '1ch', padding: '10px'}}>
                        <FilePlus/>
                        <Text>Drag and Drop or </Text>
                        <Text underline>Browse</Text>
                    </Box>
                </FileUpload>
            </InputWrapper>
        {/if}
        {#if uploading} <Loader/> {/if}
        <Box css={{ height: '2em', display: 'flex', justifyContent: 'center' }}>
            <Divider orientation='vertical' />
        </Box>
        <Tooltip label="Reload your client list. Will load changes made by other users or in a different tab.">
            <ActionIcon on:click={clientList.refresh} loading="{$processing}"><Reload/></ActionIcon>
        </Tooltip>
        <Tooltip label="Coming soon. You'll be able to export your client list to a file.">
            <Button disabled>Download</Button>
        </Tooltip>
    </Group>
        <Space h="md"/>
    {#await import('svelte-table').then(m=>m.default)}
        <Loader/>
        {:then SvelteTable}
        {#if $clientList === null || $clientList === undefined}
            {#if $processing} <Loader/>
            {:else if $error} <Alert icon={InfoCircled} title="{$error.name}" color="red">An error occurred while getting your client list.</Alert>
            {/if}
        {:else}
            {#if $clientList.length > 0}
                <Text size="xs">{$clientList.length} client(s) ({$features.clientListMaxSize} max)</Text>
                <SvelteTable columns="{columns}" rows={$clientList} sortBy="company_status" sortOrder="{-1}"></SvelteTable>
                <Button color="red" on:click={()=>{removingAll = true}}><Trash slot="leftIcon"/>Remove all clients</Button>
                {#if removingAll}
                    <Text my="xs">This will empty your client list. Are you sure?</Text>
                    <Text my="xs">This cannot be undone and all your dashboards will be empty. It's a way of resetting.</Text>
                    <Group>
                        <Button on:click={()=>{removingAll = false}}>No, keep my client list</Button>
                        <Button on:click={()=>{removingAll = false;clientList.removeAll()}} color="red">Yes, delete all clients</Button>
                    </Group>
                {/if}
            {:else}
                <Title order={3}>Get started</Title>
                <SimpleGrid cols="{2}">
                    <div>
                        <Text>The easiest way to get started with a list of your clients is to upload a spreadsheet. </Text>
                        <Text>Make an Excel spreadsheet with a column called "company number" and then put each company number on a new line, as shown in the example.</Text>
                        <Text>Save it as a CSV file ending in <code>.csv</code> and upload it.</Text>
                        <Space h="sm"/>
                        <Text>Or you can manually add clients by their company number in the text box above.</Text>
                    </div>
                    <Center><Image src={sampleSpreadsheet} width={300} height={300} caption="Sample spreadsheet to upload client list" fit="contain" usePlaceholder>
                    <svelte:fragment slot='placeholder'>
                        <Text>Failed to load image, but this is what the spreadsheet looks like:</Text>
                        <SampleSpreadsheet/>
                    </svelte:fragment>
                </Image></Center>
                </SimpleGrid>
            {/if}
        {/if}
    {:catch e}
        <ErrorAlert error="{e}"/>
    {/await}
        {:else}
        <Text>You need to be logged in to manage a client list. Try "Sign In with Xero" in the top right of this page, or go to the <Anchor root={Link} to="/" href="/" inherit>home page</Anchor></Text>
        {/if}
</Container>


<style>

</style>
