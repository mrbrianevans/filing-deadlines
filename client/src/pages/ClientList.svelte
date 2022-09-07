<script lang="ts">
  import {Box, Button, CloseButton, Container, Divider, Group, InputWrapper, Text, TextInput} from "@svelteuidev/core";
import SvelteTable from "svelte-table";
import {Temporal} from '@js-temporal/polyfill'
import type {TableColumns} from "svelte-table/src/types.js";
import type {ClientListItem} from "../../../fs-shared/ClientList.js";
  import {clientList, importClientListCsv} from "../lib/clientList.js";
import FileUpload from 'sveltefileuploadcomponent';


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
    key: 'date_added',
    title: "Added on",
    value: v => Temporal.PlainDate.from(v.date_added).toLocaleString(),
  },
  {
    key: 'remove',
    title: "Remove",
    value: v => v.company_number,
    renderComponent: CloseButton
  }
];

</script>


<Container>
    <h2>Client list</h2>
    <Group>
        <TextInput placeholder="Company number"/>
        <Button>Add</Button>
        <Box css={{ height: '2em', display: 'flex', justifyContent: 'center' }}>
            <Divider orientation='vertical' />
        </Box>
        <InputWrapper label="Upload CSV of clients" description="A CSV file with a column called 'Company number', followed by a company number on each row.">
            <FileUpload let:dragging multiple={false} on:input={e=>importClientListCsv(e.detail.files)}>
                Drag & Drop CSV or Browse
            </FileUpload>
        </InputWrapper>
    </Group>
    <SvelteTable columns="{columns}" rows={$clientList}></SvelteTable>
</Container>


<style>

</style>
