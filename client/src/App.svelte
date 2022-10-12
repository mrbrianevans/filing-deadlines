<script lang="ts">
  import { Router, Route } from "svelte-navigator";
  import {SvelteUIProvider, TypographyProvider, Seo, Header, AppShell, createStyles, Loader} from '@svelteuidev/core';
  import {isDark} from "./lib/stores/theme.ts";
  import NavBar from "./components/NavBar.svelte";
  import Home from "./pages/Home.svelte";
  import PricingPage from "./pages/PricingPage.svelte";

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
  <Seo title="Filing deadline dashboard" description="Web application for managing upcoming filing deadlines for annual accounts. Just enter your client list and the deadlines are automatically fetched from Companies House."/>
  <TypographyProvider>
    <div theme={$isDark ? 'dark' : 'light'} class="full-height">
      <AppShell>
        <Header slot="header">
            <NavBar />
        </Header>
        <slot>

          <Route path="/view/*">
            {#await import('./pages/PublicPagesRoutes.svelte').then(m=>m.default) }
              <Loader/>
            {:then PublicPagesRoutes}
              <!-- Async Load the public pages -->
              <PublicPagesRoutes />
            {/await}
          </Route>

          <Route path="/secure/*"> <!-- any path other than home requires auth. This could be changed to /user or /secure or something -->
            {#await import('./pages/AuthedPagesRoutes.svelte').then(m=>m.default) }
              <Loader/>
            {:then AuthedPagesRoutes}
              <!-- Async Load the authed pages -->
              <AuthedPagesRoutes />
            {/await}
          </Route>

          <Route path="/*"> <!-- this is to support legacy links which weren't prefixed -->
            {#await import('./pages/AuthedPagesRoutes.svelte').then(m=>m.default) }
              <Loader/>
            {:then AuthedPagesRoutes}
              <!-- Async Load the authed pages -->
              <AuthedPagesRoutes />
            {/await}
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
