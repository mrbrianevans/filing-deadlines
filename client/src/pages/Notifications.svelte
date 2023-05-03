<script lang="ts">

  import {
    Container,
    Text,
    Title,
    Button,
    Group,
    Stack,
    Space,
    Notification as SvelteNotification,
    Checkbox,
    Alert
  } from "@svelteuidev/core";
  import NotificationPermissionButton from "../components/NotificationPermissionButton.svelte";

  import {notificationNames} from '../../../fs-shared/Notifications.js'
  import {notificationPreferences} from "../lib/stores/notificationPreferences.js";
  import AnchoredLink from "../components/AnchoredLink.svelte";
  import {fetcher} from "../lib/swr.js";
  import {features} from "../lib/stores/features.js";

  let permission // updated web-notification permission
  const testWebNotification =  async () => {
    if(permission === 'denied'){
      notificationTypes[0].notification = {title:'Permission denied', body: 'You have denied permission to show notifications. If you wish to receive notifications, please allow them and try again.'}
    }else if(permission === 'default'){
      notificationTypes[0].notification = {title:'Permission not yet granted', body: 'You have not yet granted permission to show notifications. If you wish to receive notifications, please click the orange button above to allow them and try again.'}
    }
    if(permission === 'granted') {
      await fetcher('/api/user/org/member/notifications/test')
    }
  }
// could make it simply that when the user switches browser notifications on, permission is requested and the request is only sent to the server if permission is granted. might be simpler for the user.
    async function updatePreference(notificationName){
    if($notificationPreferences)
      await notificationPreferences.setPreference(notificationName, !$notificationPreferences[notificationName])
    }

  $: notificationTypes = [
    {label:"Web notifications of company filings", testNotification:testWebNotification, canBeEnabled: $features.webNotifications && permission === 'granted', notificationName: notificationNames.webFilings},
    {label:"Email notifications of company filings", canBeEnabled: false, notificationName: notificationNames.emailFilings},
    {label:"Email notifications of upcoming accounts deadlines", canBeEnabled: false, notificationName: notificationNames.emailUpcomingAccountsDeadlines},
    {label:"Email notifications of upcoming confirmation statement deadlines", canBeEnabled: false, notificationName: notificationNames.emailUpcomingConfStatDeadlines}
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
        {#each notificationTypes as notificationType}
            <Group>
                <Checkbox label={notificationType.label}
                          checked={$notificationPreferences?.[notificationType.notificationName]}
                          on:change={()=>updatePreference(notificationType.notificationName)}
                          disabled="{!notificationType.canBeEnabled || !$notificationPreferences}"/>
                <Button on:click={notificationType.testNotification} variant="subtle" disabled="{!notificationType.testNotification}">Test notification</Button>
            </Group>
            {#if notificationType.notification}
                <SvelteNotification title="{notificationType.notification.title}" loading="{notificationType.notification.loading}">{notificationType.notification.body}</SvelteNotification>
            {/if}
        {/each}
        <Alert title="Coming soon..." color="green">
            <Text inherit mb="xs">More notification types are coming soon. You can see the planned options on this page, but can't enable all of them yet.</Text>
            <Text inherit mb="xs">If there is a particular type of notification that would help you, send a request on the <AnchoredLink href="/feedback">feedback form</AnchoredLink> to have it added.</Text>
        </Alert>
    </Stack>


</Container>


<style>

</style>
