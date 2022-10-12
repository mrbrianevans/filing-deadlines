<script lang="ts">
/*
Shows a paper card. If the user is logged in, then it makes it clickable as a link, otherwise it's just a card.
Can optionally display children inside card.
 */
import {Paper, Text, Title} from "@svelteuidev/core";
import {user} from "../../lib/stores/user.js";
import LinkIf from "./LinkIf.svelte";

export let title, subtitle, link, alwaysLink=false

</script>

<LinkIf href={link} condition={alwaysLink || $user}>
    <Paper override={{background: '#f9f9f9'}}>
        <Title order={2} color="cyan" weight="bold" override={{ fontSize: '40px !important' }}>{title}</Title>
        <Text color='dimmed'>{subtitle}</Text>
        <slot/>
    </Paper>
</LinkIf>

<style>

</style>
