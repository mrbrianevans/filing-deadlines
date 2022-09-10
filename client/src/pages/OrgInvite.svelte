<script lang="ts">

  import {Anchor, Button, Container, Group, Space, Text, Title} from "@svelteuidev/core";
  import {user} from "../lib/stores/user.js";
  import {Link, navigate} from "svelte-navigator";
  import {onMount} from "svelte";
  import type {Invite} from '../../../fs-shared/OrgMemberStatus.js'
  import AsyncDate from "../components/AsyncDate.svelte";
  import {fetcher, poster, updater} from "../lib/swr.js";

  let invite: Invite
  onMount(async ()=>{
    invite = await fetcher('/api/user/org/invites')
  })
  let acceptLoading = false
  async function acceptInvite(){
    acceptLoading = true
    const success = await poster('/api/user/org/acceptInvitation?orgId='+invite.orgId, {})
    acceptLoading = false
    await user.refresh()
    if(success) navigate('/dashboard')
  }
</script>


<Container>
    {#if $user}
        {#if invite}
            <Title order={2}>You've been invited to join {invite.orgName}</Title>
            <Text>{invite.invitedByName} invited you to join the organisation on <AsyncDate date={invite.invitedOn.split('T')[0]}/></Text>
            <Space h="sm"/>
            <Group>
                <Button color="green" on:click={acceptInvite} loading="{acceptLoading}">Accept</Button>
                <Button color="red" on:click={()=>navigate('/')} disabled>Reject</Button>
            </Group>
            <Space h="sm"/>
            <Text color="dimmed">Accepting the invitation will give you access to view the dashboard and client list, and also to edit the client list.</Text>
            {:else }
            <Title order={2}>Invitation to organisation</Title>
            <Text>You do not have any pending invites to join an organisation. Ask the person who set up your organisation in this app to invite you by your Xero email address.</Text>
        {/if}
    {:else}
        <Title order={2}>Invitation to organisation</Title>
        <Text>You need to be logged in to manage organisational access. Try "Sign In with Xero" in the top right of this page, or go to the <Anchor root={Link} to="/" href="/" inherit>home page</Anchor></Text>
    {/if}
</Container>


<style>

</style>
