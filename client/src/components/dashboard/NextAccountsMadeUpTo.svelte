<script lang="ts">

  import type {DashboardDataItem} from '../../../../fs-shared/DashboardData.js'
  import AsyncDate from "../AsyncDate.svelte";
  export let row: DashboardDataItem
  export const col: any = null
</script>

<AsyncDate date={row.next_accounts_made_up_to}/>


<style>

</style>
