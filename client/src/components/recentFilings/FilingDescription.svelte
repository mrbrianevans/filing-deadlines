<script lang="ts">

    import {Text} from "@svelteuidev/core";

    export let row
    export let getFilingDescription: (row: any) => string

    $: description = getFilingDescription(row)
    $: parts = description?.match(/^(\*\*(.*)\*\*)?(.*)$/)
</script>


<Text>
    {#if parts}
        <b>{parts[2]??''}</b>
        {parts[3]??''}
    {:else}
        {description??''}
    {/if}
</Text>


<style>
    b{
        font-weight: 600;
    }
</style>
