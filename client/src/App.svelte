<script lang="ts">
  import { Router, Route } from "svelte-navigator";
  import {
    SvelteUIProvider,
    TypographyProvider,
    Seo,
    Header,
    AppShell,
    createStyles,
    Loader,
    Footer, ShellSection, Alert
  } from '@svelteuidev/core';
  import {isDark} from "./lib/stores/theme.ts";
  import NavBar from "./components/NavBar.svelte";
  import Home from "./pages/Home.svelte";
  import PricingPage from "./pages/PricingPage.svelte";
  import WebsiteFooter from "./components/WebsiteFooter.svelte";
  import ErrorAlert from "./components/ErrorAlert.svelte";

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
    <div theme={$isDark ? 'dark' : 'light'} >
      <AppShell>
        <Header slot="header">
            <NavBar />
        </Header>
        <WebsiteFooter slot="footer"/>
        <slot>
<div class="full-height">
          <Route path="/view/*">
            {#await import('./pages/PublicPagesRoutes.svelte').then(m=>m.default) }
              <Loader/>
            {:then PublicPagesRoutes}
              <!-- Async Load the public pages -->
              <PublicPagesRoutes />
            {/await}
              <Route>
                  <!--                catchall route, waits 750 milliseconds so that auth can load before showing a not found -->
                  {#await new Promise(res=>setTimeout(res,750)) then _}
                      <ErrorAlert error={new Error('The public page you\'re looking for was not found. Trying using the navigation links to go to a page. You tried to access '+location.pathname)}></ErrorAlert>
                  {/await}
              </Route>
          </Route>

          <Route path="/secure/*"> <!-- any path other than home requires auth. This could be changed to /user or /secure or something -->
            {#await import('./pages/AuthedPagesRoutes.svelte').then(m=>m.default) }
              <Loader/>
            {:then AuthedPagesRoutes}
              <!-- Async Load the authed pages -->
              <AuthedPagesRoutes />
            {/await}
              <Route>
                  <!--                catchall route, waits 750 milliseconds so that auth can load before showing a not found -->
                  {#await new Promise(res=>setTimeout(res,750)) then _}
                      <ErrorAlert error={new Error('The secure page you\'re looking for was not found. Trying using the navigation links to go to a page. You tried to access '+location.pathname)}></ErrorAlert>
                  {/await}
              </Route>
          </Route>

          <Route path="/*"> <!-- this is to support legacy links which weren't prefixed -->
            {#await import('./pages/AuthedPagesRoutes.svelte').then(m=>m.default) }
              <Loader/>
            {:then AuthedPagesRoutes}
              <!-- Async Load the authed pages -->
              <AuthedPagesRoutes />
            {/await}
            <Route>
<!--                catchall route, waits 750 milliseconds so that auth can load before showing a not found -->
                {#await new Promise(res=>setTimeout(res,750)) then _}
              <ErrorAlert error={new Error('The top-level page you\'re looking for was not found. Trying using the navigation links to go to a page. You tried to access '+location.pathname)}></ErrorAlert>
                {/await}
            </Route>
          </Route>

  <Route path="/">
    <Home />
  </Route>
</div>
        </slot>
      </AppShell>
    </div>
  </TypographyProvider>
</SvelteUIProvider>

</Router>

<style>
  div.full-height{
    min-height: 90vh;
  }
  :global(html){
      font-family: Inter, Avenir, Helvetica, Arial, sans-serif;
  }
  :global(:root){
      --contrast: rgb(231, 234, 237);
  }
  :global(.dark-theme ){
      --contrast: rgb(47, 50, 55);
  }
</style>
