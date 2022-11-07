<script lang="ts">
/*
Shows a paper card. If the user is logged in, then it makes it clickable as a link, otherwise it's just a card.
Can optionally display children inside card.
 */
import {Paper, Text, Title} from "@svelteuidev/core";
import AnchoredLink from "../AnchoredLink.svelte";
import {user} from "../../lib/stores/user.js";

export let title, subtitle, link, alwaysLink = false, linkLabel = 'View your dashboard'

</script>

    <Paper override={{breakInside: 'avoid'}}>
        <div class="two-column">
            <div class="padded">
                <Title order={2}  weight="bold" override={{ fontSize: '40px !important' }}>{title}</Title>
                <Text color='dimmed'>{subtitle}</Text>
                <div style="height: 10px"></div>
                {#if $user || alwaysLink}
                    <slot name="link">
                        <AnchoredLink href={link}>{linkLabel}</AnchoredLink>
                    </slot>
                {/if}
            </div>
            <div class="content">

                <slot/>
            </div>
        </div>
    </Paper>

<style>
.two-column{
    display: grid;
    grid-template-columns: 50% 50%;
}
@media screen and (max-width: 700px) {
    .two-column{
        grid-template-columns: 100%;
    }
}
.padded{
    padding: 6rem 0.5rem;
}
.content{
    display: flex;
    place-items: center;
}
</style>
