<script lang="ts">
// this is a wrapper for all pages which require authentication.
import {user} from "../lib/stores/user.js";
import {Anchor, Container, Group, Text} from "@svelteuidev/core";
import {Link, Route} from "svelte-navigator";
import {onMount} from "svelte";
import SignInButton from "../components/signin/SignInButton.svelte";

onMount(()=>user.refresh())
</script>

<div>
    {#if $user}
        <slot></slot>
    {:else}
        <Route>
            <Container>
                <Text>
                    <!--            could add a login button right here -->
                    You need to be logged in to view this page.
                    Try "Sign In" if you have an account, or go to the <Anchor root={Link} to="/" href="/" inherit>home page</Anchor> to learn more about this app.
                </Text>
                <Group mt="sm">
                    <SignInButton/>
                </Group>

            </Container>

        </Route>
    {/if}
</div>


<style>

</style>
