<script lang="ts">


  import {ActionIcon, Group, Text} from "@svelteuidev/core";
  import {dashboardData} from "../../lib/stores/dashboardData.js";
  import {Height, Reload, Width} from "radix-icons-svelte";
  import AnchoredLink from "../../components/AnchoredLink.svelte";
  import {createEventDispatcher} from "svelte";

    export let title: string
    export let description: string
    export let linkUrl: string
    export let linkDisplay: string
    export let showRefresh = true
    export let footnotes: string[] = []
    export let loading = false
    export let wide = false, tall = false
    export let config
    $: config = {wide, tall}
  const dispatch = createEventDispatcher()
      function refresh(){
          dispatch('refresh')
      }
</script>

<div class="tile" class:wide class:tall>
    <div class="header">
        <h2 class="no-margin-top">{title}</h2>
        <div class="actions">
            {#if linkUrl}
                <AnchoredLink href={linkUrl}>{linkDisplay ?? linkUrl}</AnchoredLink>
            {/if}
            <div class="icons">
                {#if showRefresh}
                    <ActionIcon on:click={refresh} loading={loading}><Reload/></ActionIcon>
                {/if}
                <ActionIcon on:click={()=>{wide = !wide}} variant={wide?'light':'hover'}><Width/></ActionIcon>
                <ActionIcon on:click={()=>{tall = !tall}} variant={tall?'light':'hover'}><Height/></ActionIcon>
            </div>
        </div>
    </div>
    {#if description}
        <p>
            {description}
        </p>
    {/if}
    <slot/>

    <div class="footnotes">
        {#each footnotes as footnote}
            <Text color="dimmed" size="xs" mt="xs">{footnote}</Text>
        {/each}
    </div>
</div>


<style>

    .header{
        display: flex;
        justify-content: space-between;
    }
    .header h2{
        margin: 0;
    }

    .tile {
        padding: 1rem;
        border-radius: 10px;
        box-shadow: var(--svelteui-shadows-sm);
    }
    .tile.wide {
        grid-column: span 2;
    }

    .tile.tall {
        grid-row: span 2;
    }

    .actions{
        display: inline-flex;
        flex-wrap: wrap;
        row-gap: 3px;
        column-gap: 15px;
        justify-content: end;
        align-items: center;
    }
    .icons{
        display: flex;
        row-gap: 3px;
        column-gap: 15px;
    }
</style>
