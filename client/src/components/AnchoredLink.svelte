<script lang="ts">

    import {Anchor} from "@svelteuidev/core";
    import {Link} from "svelte-navigator";

    export let href: string

</script>


<Anchor root={Link} to="{href}" href="{href}" inherit class="hidden-on-print"><slot></slot></Anchor>
