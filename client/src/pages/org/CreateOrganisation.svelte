<script lang="ts">

  import {
    Alert,
    Box,
    Button, Divider,
    Overlay,
    SimpleGrid,
    Space, Stack,
    Text,
    TextInput,
    Title
  } from "@svelteuidev/core";
  import {fetcher, poster} from "../../lib/swr.js";
  import AnchoredLink from "../../components/AnchoredLink.svelte";
  import {orgMembers} from "../../lib/stores/org.js";
  import {user} from "../../lib/stores/user.js";

  let newOrgName = ''
  let newOrgAddress = {postCode: '', addressLine1: ''}
  let creating = false
  let errorCreating = false
  let created = false
  async function createOrg(){
    creating = true
    const success = await poster('/api/user/org/', {name: newOrgName, address: newOrgAddress})
    errorCreating = !success // ideally it would show an error message if something failed
    created = success // show a message to say well done if success
    newOrgName = ''
    await Promise.allSettled([orgMembers.refresh(), user.refresh()])
    creating = false
  }

    let blockCreating = false
</script>


<div>
    <Title order={3}>Create or join an organisation</Title>
    {#if errorCreating}
        <Space h="sm"/>
        <Alert color="red" title="Error creating a new organisation">
            <Text>Make sure that the name is unique, and that you aren't already a part of another organisation.</Text>
            <Text>Try refreshing the page, but if that doesn't work you can submit a <AnchoredLink href="/secure/feedback">contact form</AnchoredLink>.</Text>
        </Alert>
    {/if}
    {#if created}
        <Space h="sm"/>
        <Alert color="green" title="Successfully created {$user.orgName}">
            <Text>You've successfully created a new organisation called <b>{$user.orgName}</b>.</Text>
<!--            <Text>You can add members to allow them to access your client list, or you can go to the <AnchoredLink href="/secure/clients">client list page</AnchoredLink> add start adding some clients.</Text>-->
            <Text>You need to pick a subscription plan to get access to features.</Text>
        </Alert>
    {/if}

    {#await fetcher('/api/user/org/invites').then(r=>{blockCreating = Boolean(r); return r}) then invite}
        {#if invite}
            <Space h="sm"/>
                <Alert color="green" title="Join {invite.orgName}">
                    <Text override={{lineHeight: 1.5}}>You have been invited to join {invite.orgName}. <AnchoredLink href="/secure/org-invite">View your invite</AnchoredLink>.</Text>
                </Alert>
        {/if}
    {/await}

    <Box css={{position: 'relative', borderRadius: '$md'}} py="xl" my="xl">
        {#if blockCreating}
            <Overlay opacity={0.2} color="#000" zIndex={5} blur={1}>
                <Text>You need to respond to your invite before you can create a new organisation.</Text>
            </Overlay>
        {/if}
        <Text>You need to belong to an organisation before you can manage a client list or view the dashboard. Either create one, or ask someone to add you to one they have created.</Text>

        <SimpleGrid cols={1} breakpoints={[{ minWidth: 'md', cols: 2 }]} my="lg">
            <Box css={{backgroundColor: '#8882', borderRadius: '$md'}} p="md">
                <Title order={4}>Create</Title>
                <Text css={{lineHeight:1.2}}>Create a new organisation on Filing Deadlines. This will create an empty client list for you and allow you to invite other users to have shared access.</Text>

                <Space h="sm"/>
                <Stack grow>
                    <TextInput required bind:value={newOrgName} invalid="{errorCreating}" label="Organisation name"/>
                    <Divider/>
                    <Text size="md" weight="semibold">Organisation registered office address</Text>
                    <TextInput required label="Post code" bind:value={newOrgAddress.postCode}/>
                    <TextInput label="Address line 1 (optional)" bind:value={newOrgAddress.addressLine1}/>
                    <Button on:click={createOrg} loading="{creating}">Create</Button>
                    <Text color="dimmed" size="sm">After this, you'll be able to choose a subscription plan for your organisation.</Text>
                </Stack>
            </Box>

            <Box css={{backgroundColor: '#8882', borderRadius: '$md'}} p="md">
                <Title order={4}>Join</Title>
                <Text css={{lineHeight:1.2}}>If someone else in your firm has already created an organisation on Filing Deadlines then ask them to invite you with the email address you use to log in.</Text>
                <Text css={{lineHeight:1.2}}>Once you've accepted their invitation, you will be granted shared access to their client list and dashboards.</Text>
            </Box>
        </SimpleGrid>
    </Box>

</div>


<style>
</style>
