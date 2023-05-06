<script lang="ts">
  import {ActionIcon, Button, Group} from "@svelteuidev/core";
  import {sentenceCase} from "change-case";
  import {Reload} from "radix-icons-svelte";
  import {onMount} from "svelte";
  import {fetcher, poster, updater} from "../lib/swr.js";
  import {serviceWorkerUrl} from "../lib/serviceWorkerUrl.js";

  const webNotificationsWork = "Notification" in window

  function getPermission() {
    return webNotificationsWork ? Notification.permission : 'not-supported'
  }

  async function checkCurrentBrowserSubscribed() {
    const registration = await navigator.serviceWorker?.getRegistration(serviceWorkerUrl)
    const subscription = await registration?.pushManager?.getSubscription()
    return Boolean(subscription) && await updater(`/api/user/org/member/notifications/checkSubscription`, subscription.toJSON())
  }

  export let permission = getPermission()
  let thisBrowserSubscribed = true
  onMount(() => {
    const interval = setInterval(() => permission = getPermission(), 2_000) // check every 2 seconds
    checkCurrentBrowserSubscribed().then(isSubbed => thisBrowserSubscribed = isSubbed)
    return () => clearInterval(interval)
  })

  async function requestPermission() {
    permission = getPermission()
    if (permission === 'default')
      permission = await Notification.requestPermission()
  }

  const colors = {
    'default': 'orange',
    granted: 'green',
    denied: 'red', 'not-supported': 'red'
  }

  let settingCurrentBrowser = false

  async function setCurrentBrowser() {
    settingCurrentBrowser = true
    const registration = await navigator.serviceWorker?.getRegistration(serviceWorkerUrl)
    const subscription = await registration.pushManager.getSubscription()
    await poster(`/api/user/org/member/notifications/subscription`, subscription.toJSON())
    await checkCurrentBrowserSubscribed().then(isSubbed => thisBrowserSubscribed = isSubbed)
    settingCurrentBrowser = false
  }

  // if permission is granted/changed, it needs to be sent to the backend server so that it knows it can send notifications.
  async function onUpdate(newPermission) {
    await poster('/api/user/org/member/notifications/permissions', {permission: newPermission})
    if (newPermission === 'granted') {
      const registration = await navigator.serviceWorker?.getRegistration(serviceWorkerUrl)
      if (registration) {
        const subscriptionExists = await registration.pushManager.getSubscription()
        if (!subscriptionExists) {
          settingCurrentBrowser = true
          const vapidKey = await fetcher(`/api/user/org/member/notifications/vapidKey`)
          const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: vapidKey
          })
          await poster(`/api/user/org/member/notifications/subscription`, subscription.toJSON())
          await checkCurrentBrowserSubscribed().then(isSubbed => thisBrowserSubscribed = isSubbed)
          settingCurrentBrowser = false
        }
      } else {
        // serious error cause SW hasn't been registered
        await poster('/api/error', {
          message: 'service worker hasn\'t been registered, preventing a Push Subscription from being created when Notifications permission was granted.',
          component: 'NotificationPermissionButton',
          error: 'no service worker'
        })
      }
    }
  }

  $: onUpdate(permission)
</script>

<Group spacing="xs">
  <Button color={colors[permission]}
          on:click={requestPermission}>{permission === 'default' ? 'Not granted - click to allow' : sentenceCase(permission)}</Button>
  <ActionIcon on:click={()=>permission = getPermission()}>
    <Reload/>
  </ActionIcon>
  <Button disabled={thisBrowserSubscribed || permission !== 'granted'} loading={settingCurrentBrowser}
          on:click={setCurrentBrowser}>Send notifications to this browser
  </Button>
</Group>

<style>

</style>
