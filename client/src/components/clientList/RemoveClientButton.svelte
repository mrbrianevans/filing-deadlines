<script lang="ts">
  import {ActionIcon, CloseIcon} from "@svelteuidev/core";
  import {clientList} from "../../lib/stores/clientList.js";
  import type {ClientListItem} from "../../../../fs-shared/ClientList.js";
  import {Trash} from "radix-icons-svelte";
  export let row: ClientListItem
  export const col: any = null
</script>

<ActionIcon color="red" on:click={()=>clientList.remove(row.company_number)}><Trash/></ActionIcon>


