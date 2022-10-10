<script lang="ts">

    import {Link} from "svelte-navigator";

    export let href, condition

</script>

{#if condition}
    <Link to={href}><slot/></Link>
{:else}
    <slot/>
{/if}
