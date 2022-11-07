<script lang="ts">

  import {Button, Menu, Space} from "@svelteuidev/core";
  import {ChevronDown, ChevronUp, Person} from "radix-icons-svelte";
  import SignInWithAuth0Button from "./SignInWithAuth0Button.svelte";
  import SignInWithXeroButton from "./SignInWithXeroButton.svelte";
  import {user} from "../../lib/stores/user.js";
  const {Item: MenuItem, Label: MenuLabel} = Menu

  export let buttonOverride = {
    '&.svelteui-Menu-item': {
      padding: 0
    },
    '& .itemLabel': {
      width: '100%'
    }
  }
  let opened = false
  const {processing} = user
</script>


<!-- the right margin is because the placement prop isn't working. when it gets fixed the margin can be removed -->
<Menu placement="end" mr="{200}" on:open={()=>user.refresh()}>
<!--    the events on:open and on:close are not working. ideally, it should refresh the user state when the user clicks sign in -->
    <Button slot="control" on:click={()=>user.refresh()} loading={$processing}>
        <Person slot="leftIcon"/>
        Sign in
        <svelte:component this={opened ? ChevronUp : ChevronDown} slot="rightIcon"/>
    </Button>
    <MenuLabel>
<!--        You don't need to already have an account to sign in. It's the same process whether or not you have an account.  -->
        Sign up and sign in combined
    </MenuLabel>
    <MenuItem root="div" override="{buttonOverride}"><SignInWithAuth0Button/></MenuItem>
        <Space h="xs"/>
    <MenuItem root="div" override="{buttonOverride}"><SignInWithXeroButton/></MenuItem>

</Menu>

<style>

</style>
