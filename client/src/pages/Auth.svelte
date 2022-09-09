<script lang="ts">

  import {Container, Button, Divider, TextInput, Space, Anchor, Group} from "@svelteuidev/core";
  import SignInWithXeroButton from "../components/SignInWithXeroButton.svelte";

  // this page has been removed from being accessible and replaced with a login button in the navbar
</script>

<Container>
<h2>Login</h2>

    <Group>
        <Button href="/api/sign-in/xero"  ripple variant="outline">Sign in with Xero</Button>
    </Group>
<!--    <SignInWithXeroButton/>-->
<Divider label="or" labelPosition="left"/>
    <h3>Register your practice</h3>
    <TextInput label="Accounting practice name" description="Used to identify your client list"/>
    <TextInput label="Your full name" description="So that we know who's logged in"/>
    <Space h="md"/>
    <Button>Register</Button>
</Container>


<style>

</style>
