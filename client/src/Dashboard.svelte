<script>
    import DataTable from "./DataTable.svelte";
    import {Button, Group, Switch} from "@svelteuidev/core";
    import data from './assets/data.json'
</script>

<div>

    <Group>
        <Button color="red" variant="outline">Export filing history report (PDF)</Button>
        <Button color="green">Export to XLSX</Button>
        <Switch label="Enable email notifications for upcoming deadlines"/>
    </Group>

    <DataTable data={data}/>


</div>
