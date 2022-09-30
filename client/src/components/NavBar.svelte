<script lang="ts">

  import {Link} from "svelte-navigator";
  import {isDark, toggleTheme} from "../lib/stores/theme.js";
  import {
    ActionIcon,
    Anchor,
    Box,
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
  import SignInWithXeroButton from "./SignInWithXeroButton.svelte";
  import AnchoredLink from "./AnchoredLink.svelte";

  let userProcessing = user.processing, userError = user.error

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
</script>

<div>
    <Box css={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 1rem' }}>
        <Title inline order={1} override={{margin:'0'}}>
            <Anchor href="/" inherit root={Link} to="/">Filing deadlines</Anchor>
        </Title>
        <Group spacing="lg">
            {#if $user}
                <Menu size="xl" closeOnItemClick="{true}">
                    <Button slot="control">
                        <HamburgerMenu slot="leftIcon"/>
                        Menu
                    </Button>
                    <Menu.Item class={classes.root} root="span">
                        <Anchor href="/" to="/" root={Link}>Home page</Anchor>
                    </Menu.Item>
                    <Divider/>
                    {#if $user.orgName}
                        <Menu.Label>Dashboards</Menu.Label>
                        <Menu.Item class={classes.root} root="span">
                            <AnchoredLink href="/clients">Client list</AnchoredLink>
                        </Menu.Item>
                        <Menu.Item class={classes.root} root="span">
                            <AnchoredLink href="/dashboard">Accounts dashboard</AnchoredLink>
                        </Menu.Item>
                        <Menu.Item class={classes.root} root="span">
                            <AnchoredLink href="/confirmation-statement-dashboard">Confirmation statements
                            </AnchoredLink>
                        </Menu.Item>
                        <Menu.Item class={classes.root} root="span">
                            <AnchoredLink href="/recent-filings">Recent filings</AnchoredLink>
                        </Menu.Item>
                        <Menu.Item class={classes.root} root="span">
                            <AnchoredLink href="/registered-office-address">
                                Registered office address
                            </AnchoredLink>
                        </Menu.Item>
                        <Divider/>
                    {/if}
                    {#if $user.owner}
                        <Menu.Label>Manage</Menu.Label>
                        <Menu.Item class={classes.root} root="span">
                            <AnchoredLink href="/manage-organisation">
                                Manage organisation
                            </AnchoredLink>
                        </Menu.Item>
                        <Divider/>
                    {/if}
                    <Menu.Item class={classes.root} root="span">
                        <AnchoredLink href="/feedback">Give feedback</AnchoredLink>
                    </Menu.Item>
                    <Divider/>
                    <Menu.Label>Settings</Menu.Label>
                    <Menu.Item icon="{$isDark ? Sun : Moon}"
                               on:click={toggleTheme}>{$isDark ? 'Light theme' : 'Dark theme'}</Menu.Item>
                    <Menu.Item class={classes.root} root="span">
                        <AnchoredLink href="/notifications">
                            Notifications
                        </AnchoredLink>
                    </Menu.Item>
                    <Menu.Item icon="{Exit}" on:click={user.logout} color="red">Logout</Menu.Item>
                </Menu>
            {/if}
            <div>
                {#if $userProcessing}
                    <Loader/>
                {:else if $userError}
                    <Text>Error, please refresh.</Text>
                {:else if $user === null || $user === undefined}
                    <SignInWithXeroButton/>
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
                            <Anchor root={Link} to="/manage-organisation"
                                    href="/manage-organisation">{$user.orgName ?? 'No organisation'}</Anchor>
                        </Text>
                    </Stack>
                {/if}
            </div>
        </Group>

    </Box>
</div>


<style>

</style>
