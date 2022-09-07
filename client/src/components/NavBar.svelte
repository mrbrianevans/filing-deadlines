<script lang="ts">

import {Link} from "svelte-navigator";
import {toggleTheme,isDark} from "../lib/theme.js";
import {Anchor, Center, SimpleGrid, Switch} from "@svelteuidev/core";
</script>

<div>
    <SimpleGrid cols={3} >
        <h1>Filing deadlines</h1>
        <Center >

            <nav>
                <Anchor root={Link} to="/">Home</Anchor>
                <Anchor root={Link} to="/login">Login</Anchor>
                <Anchor root={Link} to="/clients">Client list</Anchor>
            </nav>
        </Center>
        <Switch on:change={toggleTheme} label={$isDark ? 'Change to light':'Change to dark'} />
    </SimpleGrid>
</div>


<style>

</style>
