<script lang="ts">

  /*
  Load SvelteTable asynchronously and show loader while loading it. Allows dynamic code splitting, svelte table is shipped separately.
   */

    import {Loader} from "@svelteuidev/core";
    import ErrorAlert from "./ErrorAlert.svelte";


    export let columns
    export let rows

</script>

<div>
    {#await import('svelte-table').then(m=>m.default)}
        <Loader/>
    {:then SvelteTable}
        <SvelteTable columns={columns} rows={rows} />
    {:catch e}
        <ErrorAlert error="{e}"/>
    {/await}

</div>

