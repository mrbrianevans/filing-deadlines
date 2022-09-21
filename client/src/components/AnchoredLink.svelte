<script lang="ts">

    import {Anchor} from "@svelteuidev/core";
    import {Link} from "svelte-navigator";

    export let href: string

</script>

<!--<Link to="{href}"><slot></slot></Link>-->

<Anchor root={Link} to="{href}" href="{href}"><slot></slot></Anchor>
