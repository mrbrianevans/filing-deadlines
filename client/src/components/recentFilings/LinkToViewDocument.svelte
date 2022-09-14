<script lang="ts">
    import {Anchor} from "@svelteuidev/core";
    import {ExternalLink} from "radix-icons-svelte";

    export let row
    export let companyNumberGetter: (row:any) => string
    export let transactionIdGetter: (row:any) => string
</script>


<Anchor external href="https://find-and-update.company-information.service.gov.uk/company/{companyNumberGetter(row)}/filing-history/{transactionIdGetter(row)}/document?format=pdf&download=0">View <ExternalLink/></Anchor>


<style>

</style>
