<script lang="ts">

  import {Badge, Text} from "@svelteuidev/core";
import {swr} from "@svelte-drama/swr";
import {readableSwrOptions} from "../../lib/swr.js";
import {sentenceCase} from "sentence-case";

const startDate = new Date()
startDate.setDate(1)
const counts = swr('/api/user/org/member/recent-filings/countByCategory?startDate='+startDate.toISOString().split('T')[0], readableSwrOptions)
const {data, error, processing, refresh} = counts

$: totalCount = Object.values($data??{}).reduce((p,c)=>p+c, 0)
</script>

<div>
    <h2>Recent filings</h2>

    <p>In the last month you've filed {$data?.['accounts']??0} accounts, {$data?.['confirmation-statement']??0} confirmation statements and {totalCount} total filings. </p>

    <table class="counts-table">
        {#each Object.entries($data) as category}
            <tr><td>{sentenceCase(category[0])}</td> <td>{category[1]}</td></tr>
        {/each}
    </table>

    <Text color="dimmed" size="xs">This counts all filings for companies on your client list, including any filings made by third parties. Counts filings since {startDate.toLocaleDateString()}.</Text>
</div>


<style>
    table.counts-table{
        width: auto;
    }
    table.counts-table tr:nth-child(odd){
        background: rgb(231, 234, 237);
    }
    .dark-theme table.counts-table tr:nth-child(odd){
        background: rgb(47, 50, 55);
    }
</style>
