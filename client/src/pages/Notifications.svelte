<script lang="ts">

  import {Container, Text, Title, Switch, Button, Group, Stack, Space, Notification as SvelteNotification} from "@svelteuidev/core";

  const webNotificationsWork = "Notification" in window
  const testWebNotification = webNotificationsWork ? async () => {
    if(Notification.permission === 'denied'){
      notificationTypes[0].notification = {title:'Permission denied', body: 'You have denied permission to show notifications. If you wish to receive notifications, please allow them.', loading: true}
        const newPermish = await Notification.requestPermission()
      notificationTypes[0].notification = {title:'Permission set to '+newPermish, body: 'You have updated browser permissions to show notifications.', loading: false}
    }else if(Notification.permission === 'default'){
      notificationTypes[0].notification = {title:'Permission not yet granted', body: 'You have not yet granted permission to show notifications. If you wish to receive notifications, please allow them.', loading: true}
      const newPermish = await Notification.requestPermission()
      notificationTypes[0].notification = {title:'Permission set to '+newPermish, body: 'You have updated browser permissions to show notifications.', loading: false}
    }
    if(Notification.permission === 'granted') {
      new Notification('This is an example notification', {})
    }else{
      notificationTypes[0].notification = {title: 'You have not enabled notifications', body: 'Unable to show you any web notifications because you have not enabled them. Try test again and allow notifications when asked by your browser.'}
    }
  }: undefined

  function switchOnWebNotifications(){
    //todo: send an API request to turn them on for this user
  }

  let notificationTypes = [
    {label:"Web notifications of company filings", enabled: false, testNotification:testWebNotification, canBeEnabled: webNotificationsWork, switchOn: switchOnWebNotifications},
    {label:"Email notifications of company filings", enabled: false, canBeEnabled: false},
    {label:"Email notifications of upcoming deadlines", enabled: false, canBeEnabled: false}
  ]
</script>


<Container>
    <Title order={2}>Notifications</Title>

    <Text color="dimmed">Manage which notifications you would like to receive.</Text>

    <Space h="sm"/>

    <Stack>
        {#each notificationTypes as notificationType}
            <Group>
                <Switch label={notificationType.label} checked={notificationType.canBeEnabled?notificationType.enabled:false} disabled="{!notificationType.canBeEnabled}"/>
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
