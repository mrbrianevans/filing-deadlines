<script lang="ts">

  import {
    Text,
    Title,
    Container,
    Paper,
    ShellSection,
    SimpleGrid,
    Space,
    Image,
    Button,
    Anchor
  } from "@svelteuidev/core";
  import {isDark} from "../lib/theme.js";
  import clientListScreenshot from '../assets/client-list.png'
  import dashboardScreenshot from '../assets/dashboard.png'
  import {user} from "../lib/user.js";
  import {Link} from "svelte-navigator";
</script>

<div class="background" class:dark={$isDark}>
    <Container>
        <Paper>
            <Title order={1} variant='gradient' gradient={{from: 'blue', to: 'green', deg: 75}} weight="bold">Never miss a filing deadline.</Title>
            <Text color='dimmed'>This up-to-date dashboard will help you and your team keep track of upcoming deadlines.</Text>
        </Paper>
        <Space h="md"/>
        <SimpleGrid
                breakpoints={[
        { maxWidth: 980, cols: 1, spacing: 'md' }
    ]}
                cols={2}
        >
            <Paper>
                <Title order={3} color="blue" weight="bold" inline>Manage your client list.</Title>
                <Text color='dimmed' inline>The client list management feature allows you to keep a client list of companies to include in the dashboard.</Text>
                <ul>
                    <li>bulk load clients with CSV upload</li>
                    <li>manually edit client list (add or remove)</li>
                    <li>client details loaded automatically from Companies House</li>
                </ul>
                {#if $user}
                    <Anchor root={Link} to="/clients">Go to your client list</Anchor>
                    <Space h="md"/>
                {/if}
            <Image src="{clientListScreenshot}"></Image>

            </Paper>
            <Paper>
                <Title order={3} color="blue" weight="bold">Always up-to-date dashboard.</Title>
                <Text color='dimmed' inline>The filing deadline dashboard updates itself when changes are made to company data on Companies House.</Text>
                <ul>
                    <li>see upcoming deadlines at-a-glance</li>
                    <li>click a row to see more details about a company</li>
                    <li>highlighted based on time left to file</li>
                </ul>
                {#if $user}
                    <Anchor root={Link} to="/dashboard">Go to your dashboard</Anchor>
                    <Space h="md"/>
                {/if}
                <Image src="{dashboardScreenshot}"></Image>
            </Paper>
        </SimpleGrid>
    </Container>
</div>


<style>

</style>
