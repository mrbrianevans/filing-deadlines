<script lang="ts">

  import {ActionIcon, Badge, Loader, Text, Title, Tooltip} from "@svelteuidev/core";
import {swr} from "@svelte-drama/swr";
import {readableSwrOptions} from "../../lib/swr.js";
import {sentenceCase} from "change-case";
  import ErrorAlert from "../../components/ErrorAlert.svelte";
  import {onMount} from "svelte";
  import StatGroup from "../../components/StatGroup.svelte";
  import Stat from "../../components/Stat.svelte";
  import {months} from "../../../../fs-shared/dates.js";
  import AnchoredLink from "../../components/AnchoredLink.svelte";
  import {Reload} from "radix-icons-svelte";

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 7)
    const counts = swr('/api/user/org/member/recent-filings/countByCategory?startDate='+startDate.toISOString().split('T')[0], readableSwrOptions)
    const dataStatus = swr('/api/user/org/member/recent-filings/completeData', readableSwrOptions)
    const {data, error, processing, refresh} = counts
    const {data: completeness} = dataStatus
    onMount(()=> {
      refresh()
      dataStatus.refresh()
    })

    $: totalCount = Object.values($data??{}).reduce((p,c)=>p+c, 0)
</script>

<div>
    {#if $processing}
        <Loader color="gray"/>
    {:else if $error}
        <ErrorAlert error={$error}/>
    {:else if $data}
        <StatGroup>
            {#if $completeness && !$completeness?.completeData}
                <div>
                    <Tooltip label="Filing history is being loaded in the background for all the companies on your client list.">
                        <Badge color="orange" size="lg">Incomplete data</Badge>
                    </Tooltip>
                </div>
            {/if}
            {#each Object.entries($data) as category}
                <Stat
                label={sentenceCase(category[0])} data={category[1]}
                />
            {/each}
        </StatGroup>
<!--         could also give a set of the companies filed for in the last 7 days -->
    {/if}
</div>


<style>

</style>
