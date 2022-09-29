<script lang="ts">
  import { Router, Route } from "svelte-navigator";
  import {SvelteUIProvider, TypographyProvider, Seo, Header, AppShell, createStyles} from '@svelteuidev/core';
  import AccountsDashboard from "./pages/AccountsDashboard.svelte";
  import {isDark} from "./lib/stores/theme.ts";
  import NavBar from "./components/NavBar.svelte";
  import ClientList from "./pages/ClientList.svelte";
  import Home from "./pages/Home.svelte";
  import ManageOrg from "./pages/ManageOrg.svelte";
  import OrgInvite from "./pages/OrgInvite.svelte";
  import ConfirmationStatements from "./pages/ConfirmationStatements.svelte";
  import AuthedPage from "./pages/AuthedPage.svelte";
  import RecentFilings from "./pages/RecentFilings.svelte";
  import RegisteredOfficeAddress from "./pages/RegisteredOfficeAddress.svelte";
  import SuggestFeature from "./pages/SuggestFeature.svelte";
  import Notifications from "./pages/Notifications.svelte";

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
          <NavBar/>
        </Header>
        <slot>
          <Route path="/*"> <!-- any path other than home requires auth. This could be changed to /user or /secure or something -->
            <AuthedPage>
              <Route path="/manage-organisation">
                <ManageOrg />
              </Route>
              <Route path="/feedback">
                <SuggestFeature />
              </Route>
              <Route path="/org-invite">
                <OrgInvite />
              </Route>
              <Route path="/dashboard">
                <AccountsDashboard />
              </Route>
              <Route path="confirmation-statement-dashboard">
                <ConfirmationStatements />
              </Route>
              <Route path="/recent-filings">
                <RecentFilings />
              </Route>
              <Route path="/registered-office-address">
                <RegisteredOfficeAddress />
              </Route>
              <Route path="/clients">
                <ClientList />
              </Route>
              <Route path="/notifications">
                <Notifications />
              </Route>
            </AuthedPage>
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
