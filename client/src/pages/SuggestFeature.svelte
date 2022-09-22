<script lang="ts">

  import {
    Alert,
    Button,
    Container,
    Input,
    InputWrapper,
    NativeSelect,
    Space,
    Text,
    TextInput,
    Title
  } from "@svelteuidev/core";
  import {poster} from "../lib/swr.js";
  import type {Feedback} from '../../../fs-shared/Feedback.js'
  import {FeedbackType} from "../../../fs-shared/Feedback.js";

  const feedbackTypes: Record<string, FeedbackType> = {
    'New feature': FeedbackType.FEATURE_REQUEST,
    'Enhancement': FeedbackType.ENHANCEMENT,
    'Comment': FeedbackType.COMMENT,
    'Report a problem': FeedbackType.PROBLEM
  }

let title = ''
let description = ''
let feedbackTypeDesc = 'Comment'
  let success, loading
async function submitIdea(){
  try {
    success = undefined
    loading = true
    const feedback: Feedback = {title,  description,feedbackType: feedbackTypes[feedbackTypeDesc]}
    success = await poster('/api/user/feedback', feedback)
    if(success) {
      title = ''
      description = ''
    }
  }finally {
    loading = false
  }
}

</script>

<Container>
    <Title order={2}>Give feedback to the developer</Title>
    <Text>Feedback from users helps to improve the site. You can request a new feature be added, or an existing one improved, or you can give comments on a feature or report something that went wrong.</Text>

    <TextInput bind:value={title} label="Title" placeholder="Summarise your feedback in a few words"></TextInput>
    <NativeSelect data={Object.keys(feedbackTypes)} bind:value={feedbackTypeDesc}></NativeSelect>
    <InputWrapper label="Description">
        <Input root="textarea" bind:value={description} placeholder="Your feedback goes here..." multiline
               override={{'& .input': {height:300,resize:'vertical'}}}/>
    </InputWrapper>
    <Space h="xs"/>
    <Button on:click={submitIdea} loading={loading}>Submit</Button>
    <Space h="xs"/>
    {#if success === true}
        <Alert color="green">
            <Text inherit>Thank you for submitting feedback. </Text>
        </Alert>
    {:else if success === false}
        <Alert color="red">
            <Text inherit>Sorry, that didn't work. Try again.</Text>
        </Alert>
    {/if}
</Container>

<style>

</style>
