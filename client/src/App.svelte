<script lang="ts">
  import { Router, Link, Route } from "svelte-navigator";
  import {SvelteUIProvider, TypographyProvider, Seo, Header, AppShell} from '@svelteuidev/core';
  import {badge} from '@vaadin/vaadin-lumo-styles/badge.js'
  import Dashboard from "./Dashboard.svelte";
  import {onMount} from "svelte";
  import {isDark} from "./lib/theme.ts";
  import Auth from "./pages/Auth.svelte";
  import NavBar from "./components/NavBar.svelte";
  import ClientList from "./pages/ClientList.svelte";

  const config = {
    dark: { bg: '#1A1B1E', color: '#C1C2C5' }
  };

  onMount(()=>{
    const badgeStyle = document.createElement('style')
    badgeStyle.innerText = badge.cssText
    document.querySelector('body').appendChild(badgeStyle)
  })
</script>

<Router>
<SvelteUIProvider {config} withNormalizeCSS withGlobalStyles  themeObserver={$isDark ? 'dark' : 'light'}>
  <Seo title="Filing deadlines tracker" />
  <TypographyProvider>
    <main theme={$isDark ? 'dark' : 'light'} class="full-height">
      <AppShell>
        <Header slot="header">
          <NavBar/>
        </Header>
        <slot>
          <Route path="/">
            <Dashboard />
          </Route>
          <Route path="/login">
            <Auth />
          </Route>
          <Route path="/clients">
            <ClientList />
          </Route>
        </slot>
      </AppShell>
    </main>
  </TypographyProvider>
</SvelteUIProvider>

</Router>

<style>
  main.full-height{
    min-height: 100vh;
  }
</style>
