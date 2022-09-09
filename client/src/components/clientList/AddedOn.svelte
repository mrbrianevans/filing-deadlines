<script lang="ts">

  import type {ClientListItem} from "../../../../fs-shared/ClientList.js";
  import AsyncDate from "../AsyncDate.svelte";
  import {Tooltip} from "@svelteuidev/core";
  export let row: ClientListItem
  export let col: any
</script>

<Tooltip label="{new Date(row.added_on).toLocaleString()}">
    <AsyncDate date={row.added_on.split('T')[0]}/>
</Tooltip>

<style>

</style>
