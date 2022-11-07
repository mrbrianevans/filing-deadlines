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
  import AccountsMockup from "../components/home/AccountsMockup.svelte";
  import ConfirmationStatementsMockup from "../components/home/ConfirmationStatementsMockup.svelte";

  const override={background: '#f4f4f4'}

  const homeFeatureCards = [
    // {href:'/secure/clients', title: 'Manage your client list.', subtitle: 'Keep a list of your firms clients, import from CSV, view company status.'}
  ]
  let daysUntilMonthEnd = 31 - new Date().getDate()
</script>

<div class="background" class:dark={$isDark}>
    <Container size="lg">
        <Stack>
            <div style="margin-bottom: 5rem;">
                        <Title order={2} color="blue" weight="bold" override={{ fontSize: '60px !important' }} align="center">Never miss a filing deadline.</Title>
                        <Text color='dimmed' size="lg">Visibility of upcoming deadlines for your clients, alerting you to filings which need to be submitted soon.</Text>
                <div style="margin: 2rem 0;">
                {#if !$user}

                    <div style="display: flex;align-items: center;gap:5px;"><h2 style="margin: 0;">Get started</h2><SignInWithXeroButton/> or <SignInWithAuth0Button/></div>
                    <p>Sign in to try Filing Deadlines free. No need to create an account if you use Xero.</p>
                {/if}
                </div>
            </div>

            {#each homeFeatureCards as homeFeatureCard}
                <HomeFeatureCard link={homeFeatureCard.href} title={homeFeatureCard.title} subtitle={homeFeatureCard.subtitle}>
                </HomeFeatureCard>
            {/each}

            <HomeFeatureCard link="/secure/accounts-dashboard" linkLabel="View your accounts deadlines" title="Accounts deadlines." subtitle="Dashboard for financial accounts deadlines, with data pulled from Companies House.">
                <Screenshot urlPath="/secure/accounts-dashboard" caption="Simplified example of accounts dashboard">
                    <AccountsMockup/>
                </Screenshot>
            </HomeFeatureCard>

            <HomeFeatureCard link="/secure/dashboard" linkLabel="View your dashboard" title="Overview dashboard." subtitle="See important information at a glance. Which accounts are due this month, what has been filed in the last week, are there any confirmation statements overdue?">
               <Screenshot urlPath="/secure/dashboard" caption="Example of overview dashboard"><OverviewDashboardMockup/></Screenshot>
            </HomeFeatureCard>

            <HomeFeatureCard link="/secure/confirmation-statement-dashboard" linkLabel="View your confirmation statement deadlines" title="Confirmation statement deadlines." subtitle="Dashboard for confirmation statement deadlines, with data pulled from Companies House.">
                <Screenshot urlPath="/secure/confirmation-statement-dashboard" caption="Simplified example of confirmation statements dashboard">
                    <ConfirmationStatementsMockup/>
                </Screenshot>
            </HomeFeatureCard>

            <HomeFeatureCard link="/secure/clients" linkLabel="View your client list" title="Manage your client list." subtitle="Keep a list of your firms clients, import from CSV, view company status.">
                <Screenshot urlPath="/secure/clients" caption="Example of client list management feature">
                    <Image src={clientListScreenshot}/>
<!--                    <table class="no-breaks client-list">-->
<!--                        <tr><th>Company number</th> <th>Client name</th> <th>Status</th></tr>-->
<!--                        <tr><td>12370973</td> <td>Joinery LTD</td> <td>Active</td></tr>-->
<!--                        <tr><td>12370973</td> <td>Joinery LTD</td> <td>Active</td></tr>-->
<!--                        <tr><td>12370973</td> <td>Joinery LTD</td> <td>Active</td></tr>-->
<!--                        <tr><td>12370973</td> <td>Joinery LTD</td> <td>Active</td></tr>-->
<!--                    </table>-->
                </Screenshot>
            </HomeFeatureCard>

            <HomeFeatureCard link="/secure/recent-filings" linkLabel="View your recent filings" title="Recent filings." subtitle="See a recent history of filings for the companies on your client list.">
<!--                <Image src={clientListScreenshot}/>-->
            </HomeFeatureCard>

            <HomeFeatureCard link="/secure/notifications" linkLabel="View your notification settings" title="Filing notifications." subtitle="Easily subscribe to receive pop-up notifications in your web browser whenever there is a new filing for a company on your client list.">
                <Image src={notificationScreenshot} class="notification-image" width={400}/>
            </HomeFeatureCard>

            <HomeFeatureCard link="/secure/registered-office-address" linkLabel="View list" title="Companies registered at your address." subtitle="See which companies are using your address as their Registered Office Address on Companies House.">
<!--                <Image src={clientListScreenshot}/>-->
            </HomeFeatureCard>

            <HomeFeatureCard link="/view/pricing" alwaysLink linkLabel="View pricing" title="Pricing" subtitle="View pricing for accounting practices.">
<!--                <Image src={clientListScreenshot}/>-->
            </HomeFeatureCard>
            {#if !$user}

                <div style="display: flex;align-items: center;gap:5px;"><h2 style="margin: 0;">Get started</h2><SignInWithXeroButton/> or <SignInWithAuth0Button/></div>
                <p>Sign in to try Filing Deadlines free. No need to create an account if you use Xero.</p>
            {/if}
        </Stack>
    </Container>
</div>


<style>
    .notification-image{
        max-width: 400px;
    }
    table.no-breaks *{
        white-space: nowrap;
        overflow: clip;
        text-overflow: ellipsis;
    }
    table.client-list{
        max-width: 350px;
    }

</style>
