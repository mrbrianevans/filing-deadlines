<script lang="ts">
  import {Alert, Container, Group, Paper, Space, Stack, Text, Title} from "@svelteuidev/core";
  import {isDark} from "../lib/stores/theme.js";
  import {user} from "../lib/stores/user.js";
  import AnchoredLink from "../components/AnchoredLink.svelte";
  import HomeFeatureCard from "../components/home/HomeFeatureCard.svelte";
  import SignInButton from "../components/signin/SignInButton.svelte";

  const override={background: '#f4f4f4'}
</script>

<div class="background" class:dark={$isDark}>
    <Container size="lg">
        <Stack>
            <Paper {override}>
                <Title order={2} color="blue" weight="bold" override={{ fontSize: '60px !important' }} align="center">Never miss a filing deadline.</Title>
                <Text color='dimmed'>Visibility of upcoming deadlines, alerting you to filings which need to be submitted soon.</Text>
            </Paper>

            {#if $user}
                <Alert color="blue" title="Go to your dashboard" pb="lg">
                    <Text inherit>You are already signed in. Go to <AnchoredLink href="dashboard">dashboard</AnchoredLink> to see your data.</Text>
                </Alert>
            {/if}

            <HomeFeatureCard link="/secure/clients" title="Manage your client list." subtitle="Keep a list of your firms clients, import from CSV, view company status.">
            </HomeFeatureCard>

            <HomeFeatureCard link="/secure/dashboard" title="Upcoming deadlines." subtitle="Dashboards for both financial accounts and confirmation statement deadlines, with data pulled from Companies House.">
            </HomeFeatureCard>

            <HomeFeatureCard link="/secure/recent-filings" title="Recent filings." subtitle="See a recent history of filings for the companies on your client list.">
            </HomeFeatureCard>

            <HomeFeatureCard link="/secure/notifications" title="Filing notifications." subtitle="Easily subscribe to receive pop-up notifications in your web browser whenever there is a new filing for a company on your client list.">
            </HomeFeatureCard>

            <HomeFeatureCard link="/secure/registered-office-address" title="Companies registered at your address." subtitle="See which companies are using your address as their Registered Office Address on Companies House.">
            </HomeFeatureCard>

            <HomeFeatureCard link="/view/pricing" alwaysLink title="Pricing" subtitle="View pricing for accounting practices.">
            </HomeFeatureCard>


        {#if !$user}
        <Paper>
            <Title order={3} color="blue" weight="bold">Sign in with Xero to get started.</Title>
            <Group>
                <SignInButton/>
            </Group>
            <Space h="xs"/>
            <Text color='dimmed'>It won't connect to your Xero organisation, it only uses Xero to authenticate you.</Text>
            <Space h="xs"/>
        </Paper>
        {/if}

        </Stack>
    </Container>
</div>


<style>

</style>
