<script lang="ts">

  import type {DashboardDataItem} from '../../../../fs-shared/DashboardData.js'
  import {Text, Tooltip, Anchor} from "@svelteuidev/core";
  import {ExternalLink} from "radix-icons-svelte";
  export let row: DashboardDataItem
  export const col: any = null

</script>

<Text inherit>
    {row.company_number}
    <Tooltip label="Link to profile on Companies House">
       <Anchor external href="https://find-and-update.company-information.service.gov.uk/company/{row.company_number}"><ExternalLink/></Anchor>
    </Tooltip>
</Text>


<style>

</style>
