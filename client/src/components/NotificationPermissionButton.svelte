<script lang="ts">
  import {Group, ActionIcon, Button} from "@svelteuidev/core";
  import {sentenceCase} from "sentence-case";
  import {Reload} from "radix-icons-svelte";
  import {onMount} from "svelte";

  const webNotificationsWork = "Notification" in window

  function getPermission(){
    return webNotificationsWork ? Notification.permission : 'not-supported'
  }

  export let permission = getPermission()
  onMount(()=>{
    const interval = setInterval(()=>permission = getPermission(), 2_000) // check every 2 seconds
    return () => clearInterval(interval)
  })
  async function requestPermission() {
    permission = getPermission()
    if(permission === 'default')
      permission = await Notification.requestPermission()
    //todo: if permission is granted, it needs to be sent to the backend server so that it knows it can send notifications.
  }
  const colors = {
    'default': 'orange',
    granted: 'green',
    denied: 'red', 'not-supported': 'red'
  }
</script>

<Group spacing="xs">
    <Button on:click={requestPermission} color={colors[permission]}>{permission==='default'?'Not granted - click to allow':sentenceCase(permission)}</Button>
    <ActionIcon on:click={()=>permission = getPermission()}><Reload/></ActionIcon>
</Group>

<style>

</style>
