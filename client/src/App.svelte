<script lang="ts">
  import {SvelteUIProvider, TypographyProvider,Seo} from '@svelteuidev/core';
  import {badge} from '@vaadin/vaadin-lumo-styles/badge.js'
  import Dashboard from "./Dashboard.svelte";
  import {onMount} from "svelte";

  const config = {
    light: { bg: 'White', color: 'Black' },
    dark: { bg: '#1A1B1E', color: '#C1C2C5' }
  };
  onMount(()=>{
    const badgeStyle = document.createElement('style')
    badgeStyle.innerText = badge.cssText
    document.querySelector('body').appendChild(badgeStyle)
  })
</script>

<SvelteUIProvider {config} withNormalizeCSS withGlobalStyles>
  <Seo
          title="Filing deadlines tracker"
  />
  <TypographyProvider>
    <Dashboard />
  </TypographyProvider>
</SvelteUIProvider>


<style src="">

</style>
