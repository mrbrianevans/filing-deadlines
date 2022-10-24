<script lang="ts">

  import {onMount} from "svelte";
  import {user} from "../../lib/stores/user.js";
  import {features} from "../../lib/stores/features.js";
  import {Loader} from "@svelteuidev/core";
  import {Route} from "svelte-navigator";

  onMount(()=>user.refresh())
    const {processing} = user
</script>

{#if $user?.orgPlan && $features}
    <slot></slot>
{:else if $processing}
    <Loader/>
{:else}
    <!--catching this with a Route prevents the router thinking that a page was not found. but means that this component MUST have a Route in the default slot. -->
    <Route>
        <div class="message">
            <p>This feature is only available if you have a subscription plan. See pricing to learn more.</p>
        </div>
    </Route>
{/if}

<style>
.message{
    display: grid;
    place-content: center;
}
</style>
