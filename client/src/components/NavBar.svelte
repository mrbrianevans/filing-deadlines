<script lang="ts">

import {Link} from "svelte-navigator";
import {toggleTheme,isDark} from "../lib/stores/theme.js";
import {
  ActionIcon,
  Anchor, Box,
  Button,
  Center,
  Group,
  Loader,
  Navbar,
  SimpleGrid, Stack,
  Switch,
  Text, ThemeIcon, Title,
  Tooltip
} from "@svelteuidev/core";
import {user} from "../lib/stores/user.js";
import {Exit, Sun, DividerVertical, Moon} from "radix-icons-svelte";
import SignInWithXeroButton from "./SignInWithXeroButton.svelte";
let userProcessing = user.processing
</script>

<div>
    <Box css={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 1rem' }}>
        <Title order={1} override={{margin:'0'}} inline><Anchor root={Link} to="/" href="/" inherit>Filing deadlines</Anchor></Title>
        <Group spacing="lg" >
            <nav>
                <Group>
<!--                    this home link has been replaced by making the "Filing deadlines" H1 a link to home page-->
<!--                    <Anchor root={Link} to="/">Home</Anchor>-->
<!--                    <DividerVertical/>-->
                    {#if $user}
                        {#if $user.orgName}
                            <Anchor root={Link} to="/clients" href="/clients">Client list</Anchor>
                            <DividerVertical/>
                            <Anchor root={Link} to="/dashboard" href="/dashboard">Accounts dashboard</Anchor>
                            <DividerVertical/>
                            <Anchor root={Link} to="/confirmation-statement-dashboard" href="/confirmation-statement-dashboard">Confirmation statements</Anchor>
                            <DividerVertical/>
                            <Anchor root={Link} to="/recent-filings" href="/recent-filings">Recent filings</Anchor>
                        {/if}
                        {#if $user.owner}
                            <DividerVertical/>
                            <Anchor root={Link} to="/manage-access" href="/manage-access">Manage access</Anchor>
                        {/if}
                    {/if}
                </Group>
            </nav>
            <Tooltip label="{$isDark ? 'Change to light theme':'Change to dark theme'}" position="left">
        <ActionIcon on:click={toggleTheme} variant="filled" aria-label={$isDark ? 'Change to light theme':'Change to dark theme'} >
            {#if $isDark}
                <Sun/>
            {:else }
                <Moon/>
            {/if}
        </ActionIcon>
            </Tooltip>
        <div>
        {#if $userProcessing}
            <Loader/>
        {:else if $user === null || $user === undefined}
            <SignInWithXeroButton/>
        {:else}
            <Stack spacing="xs">
                <Group>
                    <Text>Logged in as {$user.name}</Text>
                    <Tooltip label="Logout" position="left">
                        <ActionIcon on:click={user.logout}  aria-label={'logout'} color="red"><Exit/></ActionIcon>
                    </Tooltip>
                </Group>
                <Text><Anchor root={Link} to="/manage-access" href="/manage-access">{$user.orgName??'No organisation'}</Anchor></Text>
            </Stack>
        {/if}
        </div>
        </Group>

    </Box>
</div>


<style>

</style>
