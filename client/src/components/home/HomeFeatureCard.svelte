<script lang="ts">
/*
Shows a paper card. If the user is logged in, then it makes it clickable as a link, otherwise it's just a card.
Can optionally display children inside card.
 */
import {Paper, Text, Title} from "@svelteuidev/core";
import AnchoredLink from "../AnchoredLink.svelte";
import {user} from "../../lib/stores/user.js";
import {paramCase} from "change-case";
import IntersectionObserver from "svelte-intersection-observer";
import {navigate} from "svelte-navigator";

export let title, subtitle, link, alwaysLink = false, linkLabel = 'View your dashboard'
let headerElement
</script>

    <Paper override={{breakInside: 'avoid'}}>
        <div class="two-column">
            <div class="padded">
                <IntersectionObserver element={headerElement} on:intersect={()=>{console.log('intersect', title);navigate('#'+paramCase(title), {replace: true})}}>
                <h2 class="feature-title" id={paramCase(title)} bind:this={headerElement}>{title}</h2>
                </IntersectionObserver>
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
h2.feature-title{
    font-size: 40px;
    font-weight: bold;
    /*color: var(--svelteui-colors-dark600);*/
}
</style>
