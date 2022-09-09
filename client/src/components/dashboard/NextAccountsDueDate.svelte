<script lang="ts">

  import type {DashboardDataItem} from '../../../../fs-shared/DashboardData.js'
  import AsyncDate from "../AsyncDate.svelte";
  export let row: DashboardDataItem
  export let col: any
</script>

<AsyncDate date={row.next_due_accounts}/>


<style>

</style>
