<script lang="ts">

import {Link} from "svelte-navigator";
import {toggleTheme,isDark} from "../lib/theme.js";
import {
  ActionIcon,
  Anchor, Box,
  Button,
  Center,
  Group,
  Loader,
  Navbar,
  SimpleGrid,
  Switch,
  Text, Title,
  Tooltip
} from "@svelteuidev/core";
import {user} from "../lib/user.js";
import {Exit, Sun, DividerVertical, Moon} from "radix-icons-svelte";

let userProcessing = user.processing
let titleStyles = {
  lineHeight: 1.5,marginTop: 0
}
</script>

<div>
    <Box css={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 1rem' }}>
        <Title order={1}><Anchor root={Link} to="/" inherit>Filing deadlines</Anchor></Title>
        <Group spacing="lg" >
            <nav>
                <Group>
<!--                    this home link has been replaced by making the "Filing deadlines" H1 a link to home page-->
<!--                    <Anchor root={Link} to="/">Home</Anchor>-->
<!--                    <DividerVertical/>-->
                    {#if $user}
                        <Anchor root={Link} to="/clients">Client list</Anchor>
                        <DividerVertical/>
                        <Anchor root={Link} to="/dashboard">Dashboard</Anchor>
                    {/if}
                </Group>
            </nav>
        <ActionIcon on:click={toggleTheme} variant="filled" aria-label={$isDark ? 'Change to light theme':'Change to dark theme'} >
            {#if $isDark}
                <Sun/>
            {:else }
                <Moon/>
            {/if}
        </ActionIcon>
        <div>
        {#if $userProcessing}
            <Loader/>
        {:else if $user === null || $user === undefined}
            <Button href="/api/sign-in/xero"  ripple variant="outline">Sign in with Xero</Button>
        {:else}
            <Group>
                <Text>Logged in as {$user.name}</Text>
                <Tooltip label="Logout" position="left">
                    <ActionIcon on:click={user.logout}  aria-label={'logout'} color="red"><Exit/></ActionIcon>
                </Tooltip>
            </Group>
        {/if}
        </div>
        </Group>

    </Box>
</div>


<style>

</style>
