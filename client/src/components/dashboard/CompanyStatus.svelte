<script lang="ts">

  import type {DashboardDataItem} from '../../../../fs-shared/DashboardData.js'
  import { Badge} from "@svelteuidev/core";
  import {company_status} from '../../assets/constants.json'
  export let row: DashboardDataItem
  export const col: any = null

</script>

<Badge size="md" variant="dot" color="{row.company_status === 'active' ? 'green': 'red'}" radius="xs">{company_status[row.company_status]}</Badge>


<style>

</style>
