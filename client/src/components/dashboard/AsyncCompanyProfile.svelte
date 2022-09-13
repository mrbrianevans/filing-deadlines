<script lang="ts">


    import {fetcher} from "../../lib/swr.js";
    import {Alert, Anchor, Loader, Paper, Stack, Text, Title, Tooltip} from "@svelteuidev/core";
    import {ExternalLink, InfoCircled} from "radix-icons-svelte";
    import CompanyNumber from "./CompanyNumber.svelte";
    import type {CompanyProfile} from "../../../../fs-shared/CompanyProfile.js";
    import CompanyStatus from "./CompanyStatus.svelte";
    import {months} from '../../../../fs-shared/dates.js'
    import {company_type,account_type} from '../../assets/constants.json'
    import AsyncDate from "../AsyncDate.svelte";

    export let companyNumber

    let companyPromise: Promise<CompanyProfile>
    $: if(companyNumber) companyPromise = fetcher('/api/user/company/'+companyNumber).then(c=> {
      if(c) return c; else throw new Error('Could not get company details')
    })

    // displays a company profile, after async fetching its details from the API. Requires user authentication.

</script>

<div>
    {#await companyPromise}
        <Loader/>
    {:then company}
        <Paper>
            <Title order={3}>{company.company_name}</Title>
            <Anchor external href="https://find-and-update.company-information.service.gov.uk/company/{company.company_number}">Link to Companies House profile<ExternalLink/></Anchor>
            <table class="details">
                <tbody>
                <tr>
                    <th>Status</th>
                    <td><CompanyStatus row={company}/></td>
                </tr>
                <tr>
                    <th>Company number</th>
                    <td>{company.company_number}</td>
                </tr>
                <tr>
                    <th>
                        <Tooltip label="Accounting reference date">
                            Year end
                        </Tooltip></th>
                    <td>{company.accounts.accounting_reference_date.day} {months[parseInt(company.accounts.accounting_reference_date.month)-1]}</td>
                </tr>
                <tr>
                    <th>Date of creation</th>
                    <td><AsyncDate date="{company.date_of_creation}"/></td>
                </tr>
                <tr>
                    <th>Accounts</th>
                    <td>
                        <Stack spacing="xs">
                            {#if company.accounts?.last_accounts?.type !== 'null'}
                                <Text size="sm">Type: {account_type[company.accounts.last_accounts.type]}</Text>
                            {/if}
                            {#if company.accounts?.last_accounts?.made_up_to}
                                <Text size="sm">Last made up to <AsyncDate date="{company.accounts.last_accounts.made_up_to}"/></Text>
                            {/if}
                            {#if company.accounts?.next_accounts?.period_end_on}
                                <Text size="sm">Next made up to <AsyncDate date="{company.accounts.next_accounts.period_end_on}"/></Text>
                            {/if}
                            <Text size="sm">Next due <AsyncDate date="{company.accounts.next_due}"/></Text>
                        </Stack>
                    </td>
                </tr>
                <tr>
                    <th>Company type</th>
                    <td>{company_type[company.type]}</td>
                </tr>
                {#if company.confirmation_statement}
                    <tr>
                        <th> Confirmation statement </th>
                        <td>
                            <Stack spacing="xs">
                                {#if company.confirmation_statement.last_made_up_to}
                                    <Text size="sm">Last made up to <AsyncDate date="{company.confirmation_statement.last_made_up_to}"/></Text>
                                {/if}
                                <Text size="sm">Next made up to <AsyncDate date="{company.confirmation_statement.next_made_up_to}"/></Text>
                                <Text size="sm">Next due <AsyncDate date="{company.confirmation_statement.next_due}"/></Text>
                            </Stack>
                        </td>
                    </tr>
                {/if}
                {#if company.annual_return}
                    <tr>
                        <th> Annual return </th>
                        <td>
                            <Stack spacing="xs">
                                <Text size="sm">Last made up to <AsyncDate date="{company.annual_return.last_made_up_to}"/></Text>
                                <Text size="sm">Next due <AsyncDate date="{company.annual_return.next_due}"/></Text>
                            </Stack>
                        </td>
                    </tr>
                {/if}
                </tbody>
            </table>
        </Paper>
    {:catch e}
        <Alert icon={InfoCircled} title="{e.name}" color="red">
            <Text inherit>An error occurred while getting the company profile information.</Text>
            <Text inherit>Try again, or look at the company profile on Companies House.</Text>
            <Text inherit><CompanyNumber row="{{company_number:companyNumber}}"/></Text>
        </Alert>
    {/await}
</div>


<style>

</style>
