<script lang="ts">
import {Route, useLocation} from "svelte-navigator";
import ErrorAlert from "../components/ErrorAlert.svelte";
import {Loader} from "@svelteuidev/core";
import Home from "./Home.svelte";
import {onMount} from "svelte";

const location = useLocation()
$: navigator.sendBeacon('/api/log/navigation', JSON.stringify($location));
function visibilityHandler(){
  navigator.sendBeacon('/api/log/visibility', JSON.stringify({visibilityState:document.visibilityState}));
}
onMount(()=>{
  document.addEventListener('visibilitychange', visibilityHandler)
  return () => document.removeEventListener('visibilitychange', visibilityHandler)
})

</script>

<Route path="/view/*">
  {#await import('./view/PublicPagesRoutes.svelte').then(m=>m.default) }
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
  {#await import('./AuthedPagesRoutes.svelte').then(m=>m.default) }
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
  {#await import('./AuthedPagesRoutes.svelte').then(m=>m.default) }
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
