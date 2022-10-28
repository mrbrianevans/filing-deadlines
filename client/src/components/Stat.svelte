<script lang="ts">

  import {Loader, Tooltip} from "@svelteuidev/core";

    export let label: string
    export let description: string = label
    export let data: number|string
    export let loading = false
    export let defaultValue = '-'
    export let formatter = (value: number|string) => value

    $: formattedValue = data ? formatter(data) : defaultValue
</script>

<Tooltip label={description} openDelay={150}>
    <div class="container">
        <span class="label">{label}</span>
        <span class="value">
            {#if loading}
                <Loader/>
            {:else}
                {formattedValue}
            {/if}
        </span>
    </div>
</Tooltip>

<style lang="scss">
.container{
    display: inline-grid;
    background: VAR(--contrast);
  padding: 10px;
  border-radius: 2px;
  .label{
    font-size: smaller;
    max-width: 200px;
  }
  .value{
    font-size: larger;
  }
}
</style>
