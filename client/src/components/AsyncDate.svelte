<script lang="ts">
    export let date = null
    export let row = null
    export let valueGetter = v => String(v)
    export let defaultValue = ''
    $: date ??= valueGetter && row ? valueGetter.call(row) : null // if date isn't provided, set it to valueGetter of row. This allows use in tables.
</script>

<span>
{#await import("@js-temporal/polyfill").then(m=>m.Temporal)}
        {date ? new Date(date).toLocaleDateString() : defaultValue}
    {:then Temporal}
        {date ? Temporal.PlainDate.from(date).toLocaleString() : defaultValue}
    {:catch e}
        {date ?? defaultValue}
{/await}
</span>

<style>

</style>
