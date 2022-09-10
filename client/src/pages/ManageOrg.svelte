<script lang="ts">

import {user} from "../lib/stores/user.js";
import {Anchor, Button, Container, Group, Text, TextInput, Title} from "@svelteuidev/core";
import {Link} from "svelte-navigator";
import {org, orgMembers} from "../lib/stores/org.js";
import {poster} from "../lib/swr.js";
import {onMount} from "svelte";
import {OrgMemberStatusPretty} from '../../../fs-shared/OrgMemberStatus.js'


let newOrgName = ''
let creating = false
let errorCreating = false
async function createOrg(){
  creating = true
  const success = await poster('/api/user/org/', {name: newOrgName})
  errorCreating = !success // ideally it would show an error message if something failed
  newOrgName = ''
  creating = false
  await Promise.allSettled([org.refresh(), orgMembers.refresh()])
}

let inviteEmail = ''
let errorInviting = false
async function inviteUser(){
  const success = await poster('/api/user/org/member/owner/invite', {email: inviteEmail})
  errorInviting = !success
  await orgMembers.refresh()
}
//todo: show some warning about creating a new org if the user has been invited to join an existing one
onMount(async ()=>{
  await Promise.allSettled([org.refresh(), orgMembers.refresh()])
})
</script>

<Container>
    <Title order={2}>Manage access</Title>
    <Text color="dimmed">Invite other users to view/edit your client list and dashboard.</Text>
    {#if $user}
        {#if $org}
            <Title order={3}>Members of {$org.name}</Title>
            <Group><TextInput placeholder="Email address" bind:value={inviteEmail} invalid="{errorInviting}" /> <Button on:click={inviteUser} loading="{creating}">Invite</Button></Group>
            <table class="members">
                {#each Object.entries($orgMembers??{}) as member}
                    <tr><td>{member[0]}</td><td>{OrgMemberStatusPretty[member[1]]}</td><td><Button disabled color="red">Remove</Button></td></tr>
                {/each}
            </table>
            <Group><Button disabled color="red">Leave organisation</Button><Button disabled color="red">Delete organisation</Button></Group>
        {:else}
            <Text>You need to belong to an organisation before you can manage members access. Either create one, or ask someone to add you to one they have created.</Text>

            <Group><TextInput placeholder="Organisation name" bind:value={newOrgName} invalid="{errorCreating}" /> <Button on:click={createOrg} loading="{creating}">Create</Button></Group>
        {/if}
    {:else}
        <Text>You need to be logged in to manage organisational access. Try "Sign In with Xero" in the top right of this page, or go to the <Anchor root={Link} to="/" href="/" inherit>home page</Anchor></Text>
    {/if}
</Container>

<style>
table.members{
    width: 50%;
}
</style>
