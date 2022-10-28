<script lang="ts">

  import {Loader, Tooltip} from "@svelteuidev/core";

    export let label: string
    export let description: string = label
    export let data: number|string
    export let loading = false
    export let defaultValue = '-'
    export let formatter = (value: number|string) => value

    $: formattedValue = data !== null && data !== undefined ? formatter(data) : defaultValue
</script>

<div class="container">
    <Tooltip label={description} openDelay={150}>
        <div class="layout">
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
</div>

<style lang="scss">
  .layout{
    padding: 0.5rem;
    display: grid;
    .label{
      font-size: smaller;
      max-width: 200px;
      min-width: 100px;
    }
    .value{
      font-size: larger;
    }
  }
.container{
  background: VAR(--contrast);
  border-radius: 2px;
  display: flex;
  align-items: end;
}
</style>
