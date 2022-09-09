<script lang="ts">
  import { Router, Route } from "svelte-navigator";
  import {SvelteUIProvider, TypographyProvider, Seo, Header, AppShell} from '@svelteuidev/core';
  import Dashboard from "./pages/Dashboard.svelte";
  import {isDark} from "./lib/theme.ts";
  import Auth from "./pages/Auth.svelte";
  import NavBar from "./components/NavBar.svelte";
  import ClientList from "./pages/ClientList.svelte";
  import Home from "./pages/Home.svelte";

  const config = {
    dark: { bg: '#1A1B1E', color: '#C1C2C5' }
  };

</script>

<Router>
<SvelteUIProvider {config} withNormalizeCSS withGlobalStyles  themeObserver={$isDark ? 'dark' : 'light'}>
  <Seo title="Filing deadlines tracker" />
  <TypographyProvider>
    <div theme={$isDark ? 'dark' : 'light'} class="full-height">
      <AppShell>
        <Header slot="header">
          <NavBar/>
        </Header>
        <slot>
          <Route path="/dashboard">
            <Dashboard />
          </Route>
          <Route path="/login">
            <Auth />
          </Route>
          <Route path="/clients">
            <ClientList />
          </Route>
          <Route path="/">
            <Home />
          </Route>
        </slot>
      </AppShell>
    </div>
  </TypographyProvider>
</SvelteUIProvider>

</Router>

<style>
  div.full-height{
    min-height: 100vh;
  }
</style>
