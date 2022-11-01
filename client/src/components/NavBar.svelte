<script lang="ts">

  import {Link} from "svelte-navigator";
  import {isDark, toggleTheme} from "../lib/stores/theme.js";
  import {getDaysLeftDuration,getDaysLeft} from '../../../fs-shared/dates.js'
  import {
    ActionIcon,
    Anchor,
    Badge, Box,
    Button,
    createStyles,
    Divider,
    Group,
    Loader,
    Menu,
    Stack,
    Text,
    Title,
    Tooltip
  } from "@svelteuidev/core";
  import {user} from "../lib/stores/user.js";
  import {Exit, HamburgerMenu, Moon, Sun} from "radix-icons-svelte";
  import AnchoredLink from "./AnchoredLink.svelte";
  import SignInButton from "./signin/SignInButton.svelte";
  import {orgSubscription} from "../lib/stores/org.js";
  import {onMount} from "svelte";

  const {Item: MenuItem, Label: MenuLabel} = Menu
  let userProcessing = user.processing

  const useStyles = createStyles(theme => ({
    root: {
      '&.itemHovered.svelteui-Menu-item': {
        backgroundColor: 'transparent', // don't change color on hover, because the button doesn't navigate to the link
        cursor: 'default' // don't give a pointer cursor when there is nothing to click. The link will have a pointer.
      },
      [`${theme.dark}  &.itemHovered.svelteui-Menu-item`]: {
        backgroundColor: 'transparent', // don't change color on hover, because the button doesn't navigate to the link
        cursor: 'default' // don't give a pointer cursor when there is nothing to click. The link will have a pointer.
      },
    [`& a`]: {
        padding: '2px 6px',
        borderRadius: '4px',
        backgroundColor: 'rgb(248, 249, 250)' ,
      [`${theme.dark} &`]: {
        backgroundColor: 'rgba(92, 95, 102, 0.35)'
      }
      }
    }
  }));
  const {classes} = useStyles();
  onMount(()=>orgSubscription.refresh())
</script>

<div class="hidden-on-print">
    <Box css={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 1rem' }}>
        <Title inline order={1} override={{margin:'0'}}>
            <Anchor href="/" inherit root={Link} to="/">Filing deadlines</Anchor>
        </Title>
        <Group spacing="lg">
            {#if $orgSubscription && $orgSubscription.status === 'evaluation'}
                <div>
                    <Tooltip label="You are trying this product out, and haven't chosen a plan yet.">
                        <Stack spacing="xs">
                            <AnchoredLink href="/secure/manage-organisation">
                                <Badge size="lg" radius="xs" color="yellow" css={{cursor: 'pointer'}}>Evaluation</Badge>
                            </AnchoredLink>
                            <AnchoredLink href="/secure/manage-organisation">
                                <Badge size="lg" radius="xs" color="orange" css={{cursor: 'pointer'}}>{getDaysLeftDuration($orgSubscription.activeUntil)}</Badge>
                            </AnchoredLink>
                        </Stack>
                    </Tooltip>
                </div>
            {/if}
            {#if $user}
                <Menu size="xl" closeOnItemClick="{true}">
                    <Button slot="control">
                        <HamburgerMenu slot="leftIcon"/>
                        Menu
                    </Button>
                    <MenuItem class={classes.root} root="span">
                        <Anchor href="/" to="/" root={Link}>Home page</Anchor>
                    </MenuItem>
                    <Divider/>
                    {#if $user.orgName && $user.orgPlan}
                        <!-- these items only show if the user is in an organisation which has an active subscription -->
                        <MenuLabel>Dashboards</MenuLabel>
                        <MenuItem class={classes.root} root="span">
                            <AnchoredLink href="/secure/clients" >Client list</AnchoredLink>
                        </MenuItem>
                        <MenuItem class={classes.root} root="span">
                            <AnchoredLink href="/secure/dashboard">Overview dashboard</AnchoredLink>
                        </MenuItem>
                        <MenuItem class={classes.root} root="span">
                            <AnchoredLink href="/secure/accounts-dashboard">Accounts dashboard</AnchoredLink>
                        </MenuItem>
                        <MenuItem class={classes.root} root="span">
                            <AnchoredLink href="/secure/confirmation-statement-dashboard">Confirmation statements
                            </AnchoredLink>
                        </MenuItem>
                        <MenuItem class={classes.root} root="span">
                            <AnchoredLink href="/secure/recent-filings">Recent filings</AnchoredLink>
                        </MenuItem>
                        <MenuItem class={classes.root} root="span">
                            <AnchoredLink href="/secure/registered-office-address">
                                Registered office address
                            </AnchoredLink>
                        </MenuItem>
                        <Divider/>
                    {/if}
                    {#if $user.owner}
                        <MenuLabel>Manage</MenuLabel>
                        <MenuItem class={classes.root} root="span">
                            <AnchoredLink href="/secure/manage-organisation">
                                Manage organisation
                            </AnchoredLink>
                        </MenuItem>
                        <Divider/>
                    {/if}
                    <MenuItem class={classes.root} root="span">
                        <AnchoredLink href="/secure/feedback">Give feedback</AnchoredLink>
                    </MenuItem>
                    <Divider/>
                    <MenuLabel>Settings</MenuLabel>
                    <MenuItem icon="{$isDark ? Sun : Moon}"
                               on:click={toggleTheme}>{$isDark ? 'Light theme' : 'Dark theme'}</MenuItem>
                    <MenuItem class={classes.root} root="span">
                        <AnchoredLink href="/secure/notifications">
                            Notifications
                        </AnchoredLink>
                    </MenuItem>
                    <MenuItem icon="{Exit}" on:click={user.logout} color="red">Logout</MenuItem>
                </Menu>
            {/if}
            <div>
                {#if $userProcessing}
                    <Loader/>
                {:else if $user === null || $user === undefined}
                    <SignInButton/>
                {:else}
                    <Stack spacing="xs">
                        <Group>
                            <Text>Logged in as {$user.name}</Text>
                            <Tooltip label="Logout" position="left">
                                <ActionIcon on:click={user.logout} aria-label={'logout'} color="red">
                                    <Exit/>
                                </ActionIcon>
                            </Tooltip>
                        </Group>
                        <Text>
                            <AnchoredLink href="/secure/manage-organisation">{$user?.orgName ?? 'No organisation'}</AnchoredLink>
                        </Text>
                    </Stack>
                {/if}
            </div>
        </Group>

    </Box>
</div>


<style>

</style>
