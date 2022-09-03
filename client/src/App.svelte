<script lang="ts">
  import {SvelteUIProvider, TypographyProvider,Seo} from '@svelteuidev/core';
  import {badge} from '@vaadin/vaadin-lumo-styles/badge.js'
  import Dashboard from "./Dashboard.svelte";
  import {onMount} from "svelte";
  import {writable} from "svelte/store";
  import {isDark} from "./lib/theme.ts";

  const config = {
    // light: { bg: 'White', color: 'Black' },
    // dark: { bg: '#1A1B1E', color: '#C1C2C5' }
  };

  onMount(()=>{
    const badgeStyle = document.createElement('style')
    badgeStyle.innerText = badge.cssText
    document.querySelector('body').appendChild(badgeStyle)
  })
</script>

<SvelteUIProvider {config} withNormalizeCSS withGlobalStyles  themeObserver={$isDark ? 'dark' : 'light'}>
  <Seo
          title="Filing deadlines tracker"
  />
  <TypographyProvider>
    <div theme={$isDark ? 'dark' : 'light'}>
      <Dashboard />
    </div>
  </TypographyProvider>
</SvelteUIProvider>
