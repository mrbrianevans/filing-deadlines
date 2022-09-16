<script lang="ts">

import {user} from "../lib/stores/user.js";
import {Alert, Anchor, Button, Container, Group, Space, Text, TextInput, Title} from "@svelteuidev/core";
import {Link} from "svelte-navigator";
import { orgMembers} from "../lib/stores/org.js";
import {fetcher, poster} from "../lib/swr.js";
import {onMount} from "svelte";
import {OrgMemberStatusPretty} from '../../../fs-shared/OrgMemberStatus.js'
import {orgAddress} from "../lib/stores/orgAddress.js";
import type {OfficeAddress} from "../../../fs-shared/OfficeAddress.js";


let newOrgName = ''
let creating = false
let errorCreating = false
let created = false
async function createOrg(){
  creating = true
  const success = await poster('/api/user/org/', {name: newOrgName})
  errorCreating = !success // ideally it would show an error message if something failed
  created = success // show a message to say well done if success
  newOrgName = ''
  creating = false
  await Promise.allSettled([orgMembers.refresh(), user.refresh()])
}

let inviteEmail = ''
let errorInviting = false
let invited = false
async function inviteUser(){
  const success = await poster('/api/user/org/member/owner/invite', {email: inviteEmail})
  errorInviting = !success
  invited = success
  await orgMembers.refresh()
}

let newAddress: OfficeAddress = {postCode: '', addressLine1: ''}
onMount(async ()=>{
  await Promise.allSettled([orgMembers.refresh(), user.refresh(),orgAddress.refresh()])
  newAddress.addressLine1 = $orgAddress?.addressLine1 ?? ''
  newAddress.postCode = $orgAddress?.postCode ?? ''
  const unsub = orgAddress.subscribe(oa => newAddress = oa ?? {postCode: '', addressLine1: ''})
  return () => unsub()
})
let {processing: addressLoading} = orgAddress
</script>

<Container>
    <Title order={2}>Manage access</Title>
    <Text color="dimmed">Invite other users to view/edit your client list and dashboard.</Text>
    {#if errorCreating}
        <Space h="sm"/>
        <Alert color="red" >
            <Text>Error creating a new organisation. Make sure that the name is unique, and that you aren't already a part of another organisation.</Text>
        </Alert>
    {/if}
    {#if $user}
        {#if $user.orgName}
            {#if created}
                <Space h="sm"/>
                <Alert color="green" >
                    <Text>You've successfully created a new organisation called <b>{$user.orgName}</b>.</Text>
                    <Text>You can add members to allow them to access your client list, or you can go straight to the <Anchor root={Link} to="/clients" href="/clients" inherit>client list</Anchor> add start adding some clients.</Text>
                </Alert>
            {/if}
            <Title order="{3}">Organisation registered office address</Title>
            <Text color="dimmed">This is required for the registered office address features.</Text>
            <Group>
                <TextInput label="Post code" bind:value={newAddress.postCode}/>
                <TextInput label="Address line 1" bind:value={newAddress.addressLine1}/>
                <Button on:click={()=>orgAddress.update(prev=>Object.assign(prev??{}, newAddress))} loading={$addressLoading}>Set address</Button>
            </Group>

            <Title order={3}>Members of {$user.orgName}</Title>
            {#if errorInviting}
                <Alert color="red" >
                    <Text>Error inviting a new member. Make sure you are the owner of the organisation, as only they can add or remove members.</Text>
                </Alert>
                <Space h="sm"/>
            {/if}
            {#if invited}
                <Alert color="green" >
                    <Text>You've successfully added a member to your organisation. The next time they log in, they will be shown an invitation to join your organisation.</Text>
                    <Text>You can see the status of their invitation in the table below.</Text>
                </Alert>
                <Space h="sm"/>
            {/if}
            <Group><TextInput placeholder="Email address" bind:value={inviteEmail} invalid="{errorInviting}" /> <Button on:click={inviteUser} loading="{creating}">Invite</Button></Group>
            <table class="members">
                {#each Object.entries($orgMembers??{}) as member}
                    <tr><td>{member[0]}</td><td>{OrgMemberStatusPretty[member[1]]}</td><td><Button disabled color="red">Remove</Button></td></tr>
                {/each}
            </table>
            <Group><Button disabled color="red">Leave organisation</Button><Button disabled color="red">Delete organisation</Button></Group>
        {:else}
            <Title order={3}>Create or join an organisation</Title>
            {#await fetcher('/api/user/org/invites') then invite}
                {#if invite}
                    <Alert><Text>You have already been invited to join {invite.orgName}. <Anchor root={Link} to="/org-invite" href="/org-invite" inherit>View your invite</Anchor>.</Text></Alert>
                {/if}
            {/await}
            <Text>You need to belong to an organisation before you can manage a client list or view the dashboard. Either create one, or ask someone to add you to one they have created.</Text>
            <Space h="sm"/>
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
