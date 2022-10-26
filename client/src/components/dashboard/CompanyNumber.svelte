<script lang="ts">

  import type {DashboardDataItem} from '../../../../fs-shared/DashboardData.js'
  import {Text, Tooltip, Anchor} from "@svelteuidev/core";
  import {ExternalLink} from "radix-icons-svelte";
  export let row: DashboardDataItem
  export const col: any = null
export let getCompanyNumber = (v) => v.company_number
  $: companyNumber = getCompanyNumber(row)
</script>

<Text inherit>
    {companyNumber}
    <Tooltip label="Link to profile on Companies House">
       <Anchor external href="https://find-and-update.company-information.service.gov.uk/company/{companyNumber}"><ExternalLink/></Anchor>
    </Tooltip>
</Text>


<style>

</style>
