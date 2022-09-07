<script lang="ts">

import {Link} from "svelte-navigator";
import {toggleTheme,isDark} from "../lib/theme.js";
import {Center, SimpleGrid, Switch} from "@svelteuidev/core";
</script>

<div>
    <SimpleGrid cols={3} >
        <h1>Filing deadlines</h1>
        <Center >

            <nav>
                <Link to="/">Home</Link>
                <Link to="/login">Login</Link>
                <Link to="/clients">Client list</Link>
            </nav>
        </Center>
        <Switch on:change={toggleTheme} label={$isDark ? 'Change to light':'Change to dark'} />
    </SimpleGrid>
</div>


<style>

</style>
