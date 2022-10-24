<script lang="ts">

  import {Alert, Button, Group, Space, Text, TextInput, Title} from "@svelteuidev/core";
  import {user} from "../../lib/stores/user.js";
  import {OrgMemberStatusPretty, potentiallyActiveMemberStatuses} from '../../../../fs-shared/OrgMemberStatus.js'
  import {poster} from "../../lib/swr.js";
  import {orgMembers} from "../../lib/stores/org.js";
  import {features} from "../../lib/stores/features.js";

  let inviteEmail = ''
  let errorInviting = false
  let invited = false
  async function inviteUser(){
    const success = await poster('/api/user/org/member/owner/invite', {email: inviteEmail})
    errorInviting = !success
    invited = success
    await orgMembers.refresh()
  }
  $: addingMembersDisabled = Object.values($orgMembers??{}).filter(s=>potentiallyActiveMemberStatuses.has(s)).length >= $features.organisationMaxMembers
</script>

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
{#if $user.owner}
    <Text color="dimmed">Members can edit the client list and view all the dashboards.</Text>
    <Space h="xs"/>
    <Group>
        <TextInput placeholder="Email address" bind:value={inviteEmail} invalid="{errorInviting}" disabled={addingMembersDisabled}/>
        <Button on:click={inviteUser} disabled={addingMembersDisabled}>Invite</Button>
    </Group>
{/if}
<Space h="md"/>
<Text size="xs">{Object.values($orgMembers??{}).filter(s=>potentiallyActiveMemberStatuses.has(s)).length} active or invited member(s) ({$features.organisationMaxMembers} max)</Text>
<table class="members">
    {#each Object.entries($orgMembers??{}) as member}
        <tr><td>{member[0]}</td><td>{OrgMemberStatusPretty[member[1]]}</td><td><Button disabled color="red">Remove</Button></td></tr>
    {/each}
</table>
<Group><Button disabled color="red">Leave organisation</Button><Button disabled color="red">Delete organisation</Button></Group>


<style>
    table.members{
        width: 50%;
    }
</style>
