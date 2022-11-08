<script lang="ts">
  import {Router} from "svelte-navigator";
  import {AppShell, createStyles, Header, Seo, SvelteUIProvider, TypographyProvider} from '@svelteuidev/core';
  import {isDark} from "./lib/stores/theme.ts";
  import NavBar from "./components/NavBar.svelte";
  import WebsiteFooter from "./components/WebsiteFooter.svelte";
  import Routes from "./pages/Routes.svelte";

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
  <Seo title="Filing deadline dashboard" description="Web application for managing upcoming filing deadlines for annual accounts. Just upload your client list and the deadlines are automatically fetched from Companies House."/>
  <TypographyProvider>
    <div theme={$isDark ? 'dark' : 'light'} >
      <AppShell>
        <Header slot="header">
            <NavBar />
        </Header>
        <WebsiteFooter slot="footer"/>
        <slot>
    <div class="full-height">
            <Routes/>
    </div>
        </slot>
      </AppShell>
    </div>
  </TypographyProvider>
</SvelteUIProvider>

</Router>

<style>
    @media screen {
        div.full-height {
            min-height: 90vh;
        }
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

    @media print {
        :global(.hidden-on-print) {
            display: none;
        }
    }
    @media print {
        :global(main.main) {
            padding: 0 !important;
        }
    }
    :global(.no-top-margin){
        margin-top: 0 !important;
    }
</style>
