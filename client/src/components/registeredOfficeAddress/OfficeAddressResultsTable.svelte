<script lang="ts">

import {Loader} from "@svelteuidev/core";
import type {RegisteredAddressResults, RegisteredAddressResult} from "../../../../fs-shared/OfficeAddress.js";
import type {TableColumns} from "svelte-table/src/types.js";
import CompanyNumber from "../dashboard/CompanyNumber.svelte";
import CompanyName from "../dashboard/CompanyName.svelte";
import CompanyStatus from "../dashboard/CompanyStatus.svelte";
import {company_status, company_type} from "../../assets/constants.json";

let columns: TableColumns<RegisteredAddressResult> = [
  {
    key: 'company_number',
    title: "Company number",
    value: row => row.company_number,
    renderComponent: CompanyNumber,
  },
  {
    key: 'company_name',
    title: "Company name",
    value: row => row.company_name,
    renderComponent: CompanyName,
    sortable: true
  },
  {
    key: 'company_status',
    title: 'Company status',
    renderComponent: CompanyStatus,
    value: v => company_status[v.company_status]?? '',
    sortable: true
  },
  {
    key: 'company_type',
    title: 'Company type',
    value: v => company_type[v.company_type]?? ''
  },
]
export let data: RegisteredAddressResults = []
</script>

{#await import('svelte-table').then(m=>m.default)}
    <Loader/>
{:then SvelteTable}
    <SvelteTable columns={columns} rows={data} />
{/await}

<style>

</style>
