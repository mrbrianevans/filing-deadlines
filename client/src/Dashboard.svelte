<script>
    import DataTable from "./DataTable.svelte";
    import {AppShell, Header} from "@svelteuidev/core";
    import data from './assets/data.json'
</script>

<main>

<AppShell>
    <Header slot="header">
        <h1>Filing deadlines</h1>
    </Header>
    <slot>
        <DataTable data={data}/>
    </slot>
</AppShell>


</main>
