<script>
    import SuccessPage from "./SuccessPage.svelte";
    import {Route} from "svelte-navigator";
    import CancelPage from "./CancelPage.svelte";
</script>

<div>

    <Route path="/success">
        <SuccessPage/>
    </Route>

    <Route path="/cancel">
        <CancelPage/>
    </Route>

</div>
