<script lang="ts">
// this is a wrapper for all pages which require authentication.
import {user} from "../lib/stores/user.js";
import {Anchor, Text} from "@svelteuidev/core";
import {Link} from "svelte-navigator";
</script>

<div>
    {#if $user}
        <slot></slot>
    {:else}
        <Text>
<!--            could add a login button right here -->
            You need to be logged in to view this page.
            Try "Sign In with Xero" in the top right of this page, or go to the <Anchor root={Link} to="/" href="/" inherit>home page</Anchor> to learn more about this app.
        </Text>
    {/if}
</div>


<style>

</style>
