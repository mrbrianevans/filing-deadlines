<script lang="ts">


    export let date
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
