<script lang="ts">
    export let duration
    export let defaultValue = ''
</script>

<span>
{#await import("@js-temporal/polyfill")}
        {duration ?? defaultValue}
    {:then {Temporal}}
        {Temporal.Duration.from(duration).total({unit: 'days', relativeTo: Temporal.Now.plainDateISO()})} days
    {:catch e}
        {duration ?? defaultValue}
{/await}
</span>
