<script lang="ts">

  import {links} from "svelte-navigator";
  import {isDark, toggleTheme} from "../lib/stores/theme.js";
  import {getDaysLeftDuration} from '../../../fs-shared/dates.js'
  import {
    ActionIcon,
    Badge,
    Box,
    Button,
    Container,
    Group,
    Loader,
    Menu,
    Text,
    Tooltip
  } from "@svelteuidev/core";
  import {user} from "../lib/stores/user.js";
  import {ChevronDown, ChevronUp, Exit, Gear, Moon, Sun, Table} from "radix-icons-svelte";
  import AnchoredLink from "./AnchoredLink.svelte";
  import SignInButton from "./signin/SignInButton.svelte";
  import {orgSubscription} from "../lib/stores/org.js";
  import {onMount} from "svelte";

  const {Item: MenuItem, Label: MenuLabel} = Menu
  let userProcessing = user.processing

  onMount(()=>orgSubscription.refresh())
  const dashboardsMenu = [
    {label: 'Overview dashboard', href: '/secure/dashboard'},
    {label: 'Accounts deadlines', href: '/secure/accounts-dashboard'},
    {label: 'Confirmation statements', href: '/secure/confirmation-statement-dashboard'},
    {label: 'Recent filings', href: '/secure/recent-filings'},
    {label: 'Registered office address', href: '/secure/registered-office-address'}
  ]
  const settingsMenu = [
    {label: 'Home page', href: '/'},
    {label: 'Client list', href: '/secure/clients'},
    {label: 'Manage organisation', href: '/secure/manage-organisation'},
    {label: 'Give feedback', href: '/secure/feedback'},
    {label: 'Notifications', href: '/secure/notifications'}
  ]
  let dashboardsMenuOpen = false, settingsMenuOpen = false
  const closeMenus = () => {dashboardsMenuOpen = false; settingsMenuOpen = false;}
</script>

<div class="hidden-on-print" use:links>
    <Container size="xl">
    <div class="layout">
        <h1 class="title">
            <AnchoredLink href="/"><img src="/icon/icon500.svg" alt="filing deadlines icon" style="height: 40px;width:40px;" height="40px" width="40px"/> Filing deadlines</AnchoredLink>
        </h1>
        <div class="actions">
            {#if $orgSubscription && $orgSubscription.status === 'evaluation'}
                <div>
                    <Tooltip label="You are trying this product out, and haven't chosen a plan yet.">
                        <div class="evaluation-badges">
                            <AnchoredLink href="/secure/manage-organisation">
                                <Badge size="lg" radius="xs" color="yellow" css={{cursor: 'pointer'}}>Evaluation</Badge>
                            </AnchoredLink>
                            <AnchoredLink href="/secure/manage-organisation">
                                <Badge size="lg" radius="xs" color="orange" css={{cursor: 'pointer'}}>{getDaysLeftDuration($orgSubscription.activeUntil)}</Badge>
                            </AnchoredLink>
                        </div>
                    </Tooltip>
                </div>
            {/if}
            {#if $user}
                {#if $user.orgName && $user.orgPlan}
                    <Menu size="xl" closeOnItemClick="{true}" on:click={closeMenus} bind:opened={dashboardsMenuOpen}>
                        <Button slot="control" on:click={()=>{settingsMenuOpen = false}}>
                            <Table slot="leftIcon"/>
                            <span class="hide-on-mobile">Dashboards</span>
                            <svelte:component this={dashboardsMenuOpen ? ChevronUp : ChevronDown} slot="rightIcon"/>
                        </Button>
                        {#each dashboardsMenu as menuItem}
                            <a class="menu-item" class:dark-theme={$isDark} href="{menuItem.href}">
                                {menuItem.label}
                            </a>
                        {/each}
                    </Menu>
                {/if}
                <Menu size="xl" closeOnItemClick="{true}" bind:opened={settingsMenuOpen} on:click={closeMenus}>
                    <Button slot="control" variant="subtle" on:click={()=>{dashboardsMenuOpen = false}}>
                        <Gear slot="leftIcon"/>
                        <span class="hide-on-mobile">Settings</span>
                        <svelte:component this={settingsMenuOpen ? ChevronUp : ChevronDown} slot="rightIcon"/>
                    </Button>
                    {#each settingsMenu as menuItem}
                        <a class="menu-item" class:dark-theme={$isDark} href="{menuItem.href}">
                            {menuItem.label}
                        </a>
                    {/each}
                    <MenuItem icon="{$isDark ? Sun : Moon}" on:click={toggleTheme}>{$isDark ? 'Light theme' : 'Dark theme'}</MenuItem>
                    <MenuItem icon="{Exit}" on:click={user.logout} color="red">Logout</MenuItem>
                </Menu>
            {/if}
            <div>
                {#if $userProcessing}
                    <Loader/>
                {:else if $user === null || $user === undefined}
                    <SignInButton/>
                {:else}
                    <div class="user-info">
                        <div class="no-break-group">
                            <Text>Logged in as {$user.name}</Text>
                            <Tooltip label="Logout" position="left">
                                <ActionIcon on:click={user.logout} aria-label={'logout'} color="red">
                                    <Exit/>
                                </ActionIcon>
                            </Tooltip>
                        </div>
                        <Text>
                            <AnchoredLink href="/secure/manage-organisation">{$user?.orgName ?? 'No organisation'}</AnchoredLink>
                        </Text>
                    </div>
                {/if}
            </div>
        </div>

    </div>
    </Container>
</div>


<style lang="scss">
.menu-item{
    display: block;
    padding: VAR(--svelteui-space-xsPX);
    border-radius: 4px;
}
.menu-item:hover{
    background: rgb(248, 249, 250);
    text-decoration: none;
}
.dark-theme.menu-item:hover{
    background: rgba(92, 95, 102, 0.35);
}
.layout{
    display: grid;
    grid-template-columns: auto 40%;
    justify-items: center;
    align-items: center;
    padding: 0.5rem 1rem;

  .title{
    margin: 0;
    padding: 0;
    white-space: nowrap;
    justify-self: start;
  }

  .actions{
    justify-self: end;
    justify-content: flex-end;
    display: flex;
    flex-wrap: wrap-reverse;
    gap: 1rem;
  }
}
.no-break-group{
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  gap: 10px;
}
.user-info{
    display: grid;
}
.evaluation-badges{
    display: flex;
    flex-wrap: wrap;
    gap: 2px;
}
@media screen and (max-width: 1000px) {
    .evaluation-badges{
        display: none;
    }
}
@media screen and (max-width: 600px){
  .layout {
    grid-template-columns: auto;
  }
  .hide-on-mobile{
    display: none;
  }
}
</style>
