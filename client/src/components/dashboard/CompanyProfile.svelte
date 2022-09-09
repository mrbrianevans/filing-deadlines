<script lang="ts">
  import type {DashboardDataItem} from '../../../../fs-shared/DashboardData.js'
  import {Paper, Title} from "@svelteuidev/core";
  import CompanyStatus from "./CompanyStatus.svelte";

  export let row: DashboardDataItem
</script>

<div>
    <Paper>
        <Title order={3}>{row.company_name}</Title>
        Status: <CompanyStatus row={row}/>
    </Paper>
</div>


<style>

</style>
