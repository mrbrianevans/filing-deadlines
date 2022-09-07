<script lang="ts">

import {Link} from "svelte-navigator";
import {toggleTheme,isDark} from "../lib/theme.js";
import {Anchor, Button, Center, SimpleGrid, Switch, Text} from "@svelteuidev/core";
import {user} from "../lib/user.js";
</script>

<div>
    <SimpleGrid cols={4} >
        <h1>Filing deadlines</h1>
        <Center >

            <nav>
                <Anchor root={Link} to="/">Home</Anchor>
                <Anchor root={Link} to="/login">Login</Anchor>
                <Anchor root={Link} to="/clients">Client list</Anchor>
            </nav>
        </Center>
        <Switch on:change={toggleTheme} label={$isDark ? 'Change to light':'Change to dark'} />
        {#if $user !== null && $user !== undefined}
            <div>
                <Text>Logged in as {$user.name}</Text>
                <Button on:click={user.logout}>Logout</Button>
            </div>
        {/if}
    </SimpleGrid>
</div>


<style>

</style>
