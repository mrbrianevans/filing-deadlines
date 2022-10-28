<script lang="ts">

  import {ActionIcon, Badge, Loader, Text, Title} from "@svelteuidev/core";
import {swr} from "@svelte-drama/swr";
import {readableSwrOptions} from "../../lib/swr.js";
import {sentenceCase} from "sentence-case";
  import ErrorAlert from "../../components/ErrorAlert.svelte";
  import {onMount} from "svelte";
  import StatGroup from "../../components/StatGroup.svelte";
  import Stat from "../../components/Stat.svelte";
  import {months} from "../../../../fs-shared/dates.js";
  import AnchoredLink from "../../components/AnchoredLink.svelte";
  import {Reload} from "radix-icons-svelte";

const startDate = new Date()
startDate.setDate(1)
const counts = swr('/api/user/org/member/recent-filings/countByCategory?startDate='+startDate.toISOString().split('T')[0], readableSwrOptions)
const {data, error, processing, refresh} = counts
onMount(()=>refresh())

$: totalCount = Object.values($data??{}).reduce((p,c)=>p+c, 0)
</script>

<div>
    <Title order={2}>Recent filings</Title>
    <!--    <ActionIcon on:click={refresh}><Reload/></ActionIcon>  this was decided against because the data doesn't update often enough to make it necessary -->
    {#if $processing}
        <Loader color="gray"/>
    {:else if $error}
        <ErrorAlert error={$error}/>
    {:else if $data}
        <Text size="md" mb="sm">{months[startDate.getMonth()]} filings, counted by filing type. <AnchoredLink href="/secure/recent-filings">View all recent filings</AnchoredLink></Text>
        <StatGroup>

            {#each Object.entries($data) as category}
                <Stat
                label={sentenceCase(category[0])} data={category[1]}
                />
            {/each}
        </StatGroup>

        <Text color="dimmed" size="xs" mt="xs">This counts all filings for companies on your client list, including any filings made by third parties. Counts filings since {startDate.toLocaleDateString()}.</Text>
    {/if}
</div>


<style>
    table.counts-table{
        width: auto;
    }
    table.counts-table tr:nth-child(odd){
        background: VAR(--contrast);
    }
</style>
