<script>
    import DataTable from "./DataTable.svelte";
    import {AppShell, Button, Group, Header, SimpleGrid, Switch} from "@svelteuidev/core";
    import data from './assets/data.json'
    import {toggleTheme,isDark} from "./lib/theme.ts";
</script>

<main>

<AppShell>
    <Header slot="header">
        <SimpleGrid cols={2} >
        <h1>Filing deadlines</h1>
        <Switch on:change={toggleTheme} label={$isDark ? 'Change to light':'Change to dark'} />
        </SimpleGrid>
    </Header>
    <slot>
        <Group>
            <Button color="red" variant="outline">Export filing history report (PDF)</Button>
            <Button color="green">Export to XLSX</Button>
            <Switch label="Enable email notifications for upcoming deadlines"/>
        </Group>

        <DataTable data={data}/>
    </slot>
</AppShell>


</main>
