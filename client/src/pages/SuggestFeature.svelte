<script lang="ts">

  import {Input, InputWrapper, Text, TextInput, Title, Container, Button, Space, Badge, Alert} from "@svelteuidev/core";
  import {poster} from "../lib/swr.js";

let featureTitle = ''
let featureDescription = ''
  let success, loading
async function submitIdea(){
  try {
    success = undefined
    loading = true
    success = await poster('/api/user/featureRequest', {featureTitle, featureDescription})
    if(success) {
      featureTitle = ''
      featureDescription = ''
    }
  }finally {
    loading = false
  }
}

</script>

<Container>
    <Title order={2}>Suggest a new feature</Title>
    <Text>Do you have an idea of a new feature that would be useful, or a way an existing feature could be improved? Request it to be added.</Text>

    <TextInput bind:value={featureTitle} label="Title" placeholder="Summarise your idea in a few words"></TextInput>
    <InputWrapper label="Description">
        <Input root="textarea" bind:value={featureDescription} placeholder="Describe in detail what you idea is, how useful it would be, and what you would use it for" multiline
               override={{'& .input': {height:300,resize:'vertical'}}}/>
    </InputWrapper>
    <Space h="xs"/>
    <Button on:click={submitIdea} loading={loading}>Submit</Button>
    {#if success === true}
        <Alert color="green">
            <Text inherit>Thank you for submitting a feature request. </Text>
        </Alert>
    {:else if success === false}
        <Alert color="red">
            <Text inherit>Sorry, that didn't work. Try again.</Text>
        </Alert>
    {/if}
</Container>

<style>

</style>
