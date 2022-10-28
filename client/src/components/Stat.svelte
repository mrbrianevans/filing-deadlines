<script lang="ts">

  import {Loader, Tooltip} from "@svelteuidev/core";

    export let label: string
    export let description: string = label
    export let red = false
    export let data: number|string
    export let loading = false
    export let defaultValue = '-'
    export let formatter = (value: number|string) => value

    $: formattedValue = data !== null && data !== undefined ? formatter(data) : defaultValue
</script>

<div class="container">
    <Tooltip label={description} openDelay={150}>
        <div class="layout">
            <span class="label" class:red>{label}</span>
            <span class="value">
            {#if loading}
                <Loader variant='dots' color='gray' size="xs"/>
            {:else}
                {formattedValue}
            {/if}
        </span>
        </div>
    </Tooltip>
</div>

<style lang="scss">
  .red{
    color: VAR(--svelteui-colors-red800);
  }
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
  display: inline-flex;
  align-items: end;
}
</style>
