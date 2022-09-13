<script lang="ts">


    export let date = null
    export let row = null
    export let valueGetter = v => String(v)
    $: date ??= valueGetter(row) // if date isn't provided, set it to valueGetter of row. This allows use in tables.
</script>

<span>
{#await import("@js-temporal/polyfill").then(m=>m.Temporal)}
        {new Date(date).toLocaleDateString()}
    {:then Temporal}
        {Temporal.PlainDate.from(date).toLocaleString()}
    {:catch e}
        {new Date(date).toLocaleDateString()}
{/await}
</span>

<style>

</style>
