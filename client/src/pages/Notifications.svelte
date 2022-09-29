<script lang="ts">

  import {
    Container,
    Text,
    Title,
    Switch,
    Button,
    Group,
    Stack,
    Space,
    Notification as SvelteNotification,
    Checkbox,
    Alert
  } from "@svelteuidev/core";
  import NotificationPermissionButton from "../components/NotificationPermissionButton.svelte";
  import {} from "radix-icons-svelte";

  let permission // updated web-notification permission
  const testWebNotification =  async () => {
    if(permission === 'denied'){
      notificationTypes[0].notification = {title:'Permission denied', body: 'You have denied permission to show notifications. If you wish to receive notifications, please allow them and try again.'}
    }else if(permission === 'default'){
      notificationTypes[0].notification = {title:'Permission not yet granted', body: 'You have not yet granted permission to show notifications. If you wish to receive notifications, please allow them and try again.'}
    }
    if(permission === 'granted') {
      new Notification('This is an example notification. ', {body:'The real ones will look a bit different to this and contain useful information.'})
    }
  }

  function switchOnWebNotifications(){
    //todo: send an API request to turn them on for this user
  }

  $: notificationTypes = [
    {label:"Web notifications of company filings", enabled: false, testNotification:testWebNotification, canBeEnabled: false && permission === 'granted', switchOn: switchOnWebNotifications},
    {label:"Email notifications of company filings", enabled: false, canBeEnabled: false},
    {label:"Email notifications of upcoming deadlines", enabled: false, canBeEnabled: false}
  ]
</script>


<Container>
    <Title order={2}>Notifications</Title>

    <Text color="dimmed">Manage which notifications you would like to receive.</Text>

    <Space h="sm"/>

    <Stack>
        <Group>
            <Text>Web notifications permission: </Text>
            <NotificationPermissionButton bind:permission/>
        </Group>
        <Alert title="Coming soon..." color="green">
            <Text inherit mb="xs">Notifications are coming soon, but aren't quite ready yet. Check back tomorrow.</Text>
            <Text inherit mb="xs">For now you can just test what type of notifications they are.</Text>
        </Alert>
        {#each notificationTypes as notificationType}
            <Group>
                <Checkbox label={notificationType.label} checked={notificationType.canBeEnabled?notificationType.enabled:false} disabled="{!notificationType.canBeEnabled}"/>
                <Button on:click={notificationType.testNotification} variant="subtle" disabled="{!notificationType.testNotification}">Test notification</Button>
            </Group>
            {#if notificationType.notification}
                <SvelteNotification title="{notificationType.notification.title}" loading="{notificationType.notification.loading}">{notificationType.notification.body}</SvelteNotification>
            {/if}
        {/each}
    </Stack>


</Container>


<style>

</style>
