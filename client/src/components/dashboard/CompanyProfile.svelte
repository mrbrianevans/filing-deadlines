<script lang="ts">
  import type {DashboardDataItem} from '../../../../fs-shared/DashboardData.js'
  import {Anchor, Paper, Text, Title, Stack, Tooltip} from "@svelteuidev/core";
  import CompanyStatus from "./CompanyStatus.svelte";
  import {company_type,account_type} from '../../assets/constants.json'
    import {shortMonths} from '../../../../fs-shared/dates.js'
  import {ExternalLink} from "radix-icons-svelte";
  import AsyncDate from "../AsyncDate.svelte";

  export let row: DashboardDataItem

  function formatRefDate(v){
    return v.accounting_reference_date.day + ' ' + shortMonths[v.accounting_reference_date.month-1]
  }
</script>

<div>
    <Paper>
        <Title order={3}>{row.company_name}</Title>
        <Anchor external href="https://find-and-update.company-information.service.gov.uk/company/{row.company_number}">Link to Companies House profile<ExternalLink/></Anchor>
        <table class="details">
            <tbody>
            <tr>
                <th>Status</th>
                <td><CompanyStatus row={row}/></td>
            </tr>
            <tr>
                <th>Company number</th>
                <td>{row.company_number}</td>
            </tr>
            <tr>
                <th>
                    <Tooltip label="Accounting reference date">
                        Year end
                    </Tooltip></th>
                <td>{formatRefDate(row)}</td>
            </tr>
            <tr>
                <th>Date of creation</th>
                <td><AsyncDate date="{row.date_of_creation}"/></td>
            </tr>
                <tr>
                    <th>Accounts</th>
                    <td>
                        <Stack spacing="xs">
                            {#if row.last_accounts}
                                <Text size="sm">Type: {account_type[row.last_accounts.type]}</Text>
                                <Text size="sm">Last made up to <AsyncDate date="{row.last_accounts.made_up_to}"/></Text>
                            {/if}
                            {#if row.next_accounts_made_up_to}
                                <Text size="sm">Next made up to <AsyncDate date="{row.next_accounts_made_up_to}"/></Text>
                            {/if}
                            <Text size="sm">Next due <AsyncDate date="{row.next_due_accounts}"/></Text>
                        </Stack>
                    </td>
                </tr>
            <tr>
                <th>Company type</th>
                <td>{company_type[row.company_type]}</td>
            </tr>
            {#if row.annual_return}
                <tr>
                    <th> Annual return </th>
                    <td>
                        <Stack spacing="xs">
                            <Text size="sm">Last made up to <AsyncDate date="{row.annual_return.last_made_up_to}"/></Text>
                            <Text size="sm">Next due <AsyncDate date="{row.annual_return.next_due}"/></Text>
                        </Stack>
                    </td>
                </tr>
            {/if}
            </tbody>
        </table>
    </Paper>
</div>


<style>
    table.details{
        width: 400px;
    }
    table.details th{
        text-align: right;
    }
</style>
