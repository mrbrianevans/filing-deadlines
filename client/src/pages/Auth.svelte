<script lang="ts">

  import {Container, Button, Divider, TextInput, Space} from "@svelteuidev/core";

  // the design of this page will depend quite heavily on the auth flow logic in the backend
</script>

<Container>
<h2>Login</h2>

    <Button disabled>Sign in with Xero</Button>
<Divider label="or" labelPosition="left"/>
    <h3>Register your practice</h3>
    <TextInput label="Accounting practice name" description="Used to identify your client list"/>
    <TextInput label="Your full name" description="So that we know who's logged in"/>
    <Space h="md"/>
    <Button>Register</Button>

</Container>


<style>

</style>
