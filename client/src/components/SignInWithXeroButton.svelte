<script>

    import {isDark} from "../lib/theme";
    import {onMount} from "svelte";

    onMount(()=>{
        // can't get this to work on re-renders
        import("https://edge.xero.com/platform/sso/xero-sso.js")
    })
</script>

<span data-xero-sso data-href="/sign-in/xero" data-label="Sign In with Xero" data-size="large" data-theme="{isDark?'dark':'light'}" data-no-track="true">

</span>

<style>

</style>
