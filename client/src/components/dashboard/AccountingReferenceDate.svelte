<script lang="ts">

  import type {DashboardDataItem} from '../../../../fs-shared/DashboardData.js'
  import {Text, Badge, Tooltip} from "@svelteuidev/core";
  import {onMount} from "svelte";
  export let row: DashboardDataItem
  export const col: any = null
  let isNew
  onMount(()=>{
    isNew = Date.now() - new Date(row.date_of_creation).getTime() < 86400*1000*365 // created in the last 365 days
  })
</script>

<Text>
    {row.accounting_reference_date.day}
</Text>


<style>

</style>
