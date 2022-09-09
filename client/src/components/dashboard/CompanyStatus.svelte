<script lang="ts">

  import type {DashboardDataItem} from '../../../../fs-shared/DashboardData.js'
  import {Text, Badge, Tooltip} from "@svelteuidev/core";
  import {onMount} from "svelte";
  import {company_status} from '../../assets/constants.json'
  export let row: DashboardDataItem
  export let col: any

</script>

<Badge size="md" variant="dot" color="{row.company_status === 'active' ? 'green': 'red'}" radius="xs">{company_status[row.company_status]}</Badge>


<style>

</style>
