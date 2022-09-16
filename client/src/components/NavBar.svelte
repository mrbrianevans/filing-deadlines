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
                    {#if $user}
                        {#if $user.orgName}
                            <Anchor root={Link} to="/clients" href="/clients">Client list</Anchor>
                            <DividerVertical/>
                            <Anchor root={Link} to="/dashboard" href="/dashboard">Accounts dashboard</Anchor>
                            <DividerVertical/>
                            <Anchor root={Link} to="/confirmation-statement-dashboard" href="/confirmation-statement-dashboard">Confirmation statements</Anchor>
                            <DividerVertical/>
                            <Anchor root={Link} to="/recent-filings" href="/recent-filings">Recent filings</Anchor>
                            <DividerVertical/>
                            <Anchor href="/registered-office-address" to="/registered-office-address" root={Link}>Registered office address</Anchor>
                        {/if}
                        <!--{#if $user.owner}-->
                        <!--    <DividerVertical/>-->
                        <!--    <Anchor root={Link} to="/manage-organisation" href="/manage-organisation">Manage organisation</Anchor>-->
                        <!--{/if}-->
                    {/if}
                    <DividerVertical/>
                    <Anchor href="/feature-request" to="/feature-request" root={Link}>Request a feature</Anchor>
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
                <Text><Anchor root={Link} to="/manage-organisation" href="/manage-organisation">{$user.orgName??'No organisation'}</Anchor></Text>
            </Stack>
        {/if}
        </div>
        </Group>

    </Box>
</div>


<style>

</style>
