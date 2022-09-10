<script lang="ts">
  import { Router, Route } from "svelte-navigator";
  import {SvelteUIProvider, TypographyProvider, Seo, Header, AppShell, createStyles} from '@svelteuidev/core';
  import Dashboard from "./pages/Dashboard.svelte";
  import {isDark} from "./lib/stores/theme.ts";
  import Auth from "./pages/Auth.svelte";
  import NavBar from "./components/NavBar.svelte";
  import ClientList from "./pages/ClientList.svelte";
  import Home from "./pages/Home.svelte";
  import ManageOrg from "./pages/ManageOrg.svelte";
  import OrgInvite from "./pages/OrgInvite.svelte";

  const config = {
    light: { bg: 'White', color: 'Black' },
    dark: { bg: '#1A1B1E', color: '#C1C2C5' },
    fontFamily: 'Inter, Avenir, Helvetica, Arial, sans-serif'
  };
  const useStyles = createStyles(() => ({
    root: {
      fontFamily: 'Inter, Avenir, Helvetica, Arial, sans-serif'
    }
  }));

  let getStyles// CANNOT change the default font for some reason??? tried everything
  $: ({ getStyles } = useStyles())
</script>

<Router>
<SvelteUIProvider {config} withNormalizeCSS withGlobalStyles  themeObserver={$isDark ? 'dark' : 'light'} fontFamily="Inter, Avenir, Helvetica, Arial, sans-serif;"
override={{fontFamily: 'Inter, Avenir, Helvetica, Arial, sans-serif'}} class={getStyles()}
>
  <Seo title="Filing deadlines tracker" />
  <TypographyProvider>
    <div theme={$isDark ? 'dark' : 'light'} class="full-height">
      <AppShell>
        <Header slot="header">
          <NavBar/>
        </Header>
        <slot>
          <Route path="/manage-access">
            <ManageOrg />
          </Route>
          <Route path="/org-invite">
            <OrgInvite />
          </Route>
          <Route path="/dashboard">
            <Dashboard />
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
  :global(html){
    font-family: Inter, Avenir, Helvetica, Arial, sans-serif;
  }
</style>
