<script lang="ts">

  import type {DashboardDataItem} from '../../../../fs-shared/DashboardData.js'
  import AsyncDate from "../AsyncDate.svelte";
  import {Tooltip} from "@svelteuidev/core";
  export let row: DashboardDataItem
  export const col: any = null
</script>

{#if row.last_accounts?.made_up_to}
<AsyncDate date={row.last_accounts.made_up_to}/>
    {:else }
    <Tooltip label="Not available">
        <span>N/A</span>
    </Tooltip>
{/if}

<style>

</style>
