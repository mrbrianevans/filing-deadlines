<script lang="ts">

  import {ArrowLeft, ArrowRight, Home, LockClosed, Reload} from "radix-icons-svelte";

  export let urlPath = '/'
  export let caption: string | undefined
</script>

<div class="screenshot">

    <div class="topbar">
        <div class="icons"><ArrowLeft/><ArrowRight/><Reload/><Home/></div>
        <div class="address"><LockClosed color="green"/> <span class="url">https://filingdeadlines.co.uk{urlPath}</span></div>
    </div>

    <div class="window">
        <slot/>
    </div>

    {#if caption}
        <p class="caption">{caption}</p>
    {/if}

</div>


<style lang="scss">

.screenshot{
  box-shadow: 0 0 14px 4px #0001;
  transform: skew(-1deg, 1deg);
  user-select: none;
  overflow: hidden;
  .topbar{
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 8px;
    .icons{
      display: flex;
      gap: 6px;
    }
    .address{
      display: flex;
      align-items: center;
      gap: 4px;
      background: VAR(--contrast);
      border-radius: 4px;
      padding: 4px;
      flex-grow: 1;
      font-size: smaller;
      overflow: hidden;
      .url{
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 100%;
      }
    }

  }

  .window{
    border: 1px solid VAR(--contrast);
    padding: 4px;
  }

  .caption{
    text-align: center;
    font-style: italic;
    font-size: smaller;
    margin: 3px;
  }

}



</style>
