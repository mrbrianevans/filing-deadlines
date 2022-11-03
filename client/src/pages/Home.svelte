<script lang="ts">
  import {Alert, Button, Container, Group, Paper, Space, Stack, Text, Title, Image} from "@svelteuidev/core";
  import {isDark} from "../lib/stores/theme.js";
  import {user} from "../lib/stores/user.js";
  import AnchoredLink from "../components/AnchoredLink.svelte";
  import HomeFeatureCard from "../components/home/HomeFeatureCard.svelte";
  import SignInButton from "../components/signin/SignInButton.svelte";
  import {links} from "svelte-navigator";
  import SignInWithAuth0Button from "../components/signin/SignInWithAuth0Button.svelte";
  import SignInWithXeroButton from "../components/signin/SignInWithXeroButton.svelte";
  import clientListScreenshot from '../assets/client-list.png'
  import notificationScreenshot from '../assets/screenshots/web-notification-windows-with-border.png'
  import OverviewDashboardMockup from "../components/home/OverviewDashboardMockup.svelte";
  import Screenshot from "../components/home/Screenshot.svelte";

  const override={background: '#f4f4f4'}

  const homeFeatureCards = [
    // {href:'/secure/clients', title: 'Manage your client list.', subtitle: 'Keep a list of your firms clients, import from CSV, view company status.'}
  ]
</script>

<div class="background" class:dark={$isDark}>
    <Container size="lg">
        <Stack>
            <div style="margin-bottom: 5rem;">
                        <Title order={2} color="blue" weight="bold" override={{ fontSize: '60px !important' }} align="center">Never miss a filing deadline.</Title>
                        <Text color='dimmed' size="lg">Visibility of upcoming deadlines for your clients, alerting you to filings which need to be submitted soon.</Text>
                <div style="margin: 2rem 0;">
                {#if $user}
<!--                    <Button size="md" href="/secure/dashboard">View dashboard</Button>-->
                    <AnchoredLink href="/secure/dashboard">View dashboard</AnchoredLink>
                {:else}
<!--                    <Button size="md" variant="gradient">Try Filing Deadlines free</Button>-->
<!--                    <AnchoredLink href="/secure/dashboard">Try Filing Deadlines free</AnchoredLink>-->
                    <div style="display: flex;align-items: center;gap:5px;"><SignInWithXeroButton/> or <SignInWithAuth0Button/></div>
                    <p>Sign in to try Filing Deadlines free. No need to create an account if you use Xero.</p>
                {/if}
                </div>
            </div>

            {#each homeFeatureCards as homeFeatureCard}
                <HomeFeatureCard link={homeFeatureCard.href} title={homeFeatureCard.title} subtitle={homeFeatureCard.subtitle}>
                </HomeFeatureCard>
            {/each}

            <!-- todo: make nice samples for each feature -->
            <HomeFeatureCard link="/secure/dashboard" title="Overview dashboard." subtitle="See important information at a glance. Which accounts are due this month, what has been filed in the last week, are there any confirmation statements overdue?">
               <Screenshot><OverviewDashboardMockup/></Screenshot>
            </HomeFeatureCard>

            <HomeFeatureCard link="/secure/accounts-dashboard" title="Accounts deadlines." subtitle="Dashboard for financial accounts deadlines, with data pulled from Companies House.">
<!--                <Image src={clientListScreenshot}/>-->
            </HomeFeatureCard>

            <HomeFeatureCard link="/secure/confirmation-statement-dashboard" title="Confirmation statement deadlines." subtitle="Dashboard for confirmation statement deadlines, with data pulled from Companies House.">
<!--                <Image src={clientListScreenshot}/>-->
            </HomeFeatureCard>

            <HomeFeatureCard link="/secure/clients" title="Manage your client list." subtitle="Keep a list of your firms clients, import from CSV, view company status.">
                <Image src={clientListScreenshot}/>
            </HomeFeatureCard>

            <HomeFeatureCard link="/secure/recent-filings" title="Recent filings." subtitle="See a recent history of filings for the companies on your client list.">
<!--                <Image src={clientListScreenshot}/>-->
            </HomeFeatureCard>

            <HomeFeatureCard link="/secure/notifications" title="Filing notifications." subtitle="Easily subscribe to receive pop-up notifications in your web browser whenever there is a new filing for a company on your client list.">
                <Image src={notificationScreenshot} class="notification-image"/>
            </HomeFeatureCard>

            <HomeFeatureCard link="/secure/registered-office-address" title="Companies registered at your address." subtitle="See which companies are using your address as their Registered Office Address on Companies House.">
<!--                <Image src={clientListScreenshot}/>-->
            </HomeFeatureCard>

            <HomeFeatureCard link="/view/pricing" alwaysLink title="Pricing" subtitle="View pricing for accounting practices.">
<!--                <Image src={clientListScreenshot}/>-->
            </HomeFeatureCard>

        </Stack>
    </Container>
</div>


<style>
    .notification-image{
        max-width: 400px;
    }
</style>
