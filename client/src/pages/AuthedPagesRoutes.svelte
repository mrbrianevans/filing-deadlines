<script lang="ts">

import Notifications from "./Notifications.svelte";
import {Route} from "svelte-navigator";
import RegisteredOfficeAddress from "./RegisteredOfficeAddress.svelte";
import RecentFilings from "./RecentFilings.svelte";
import ConfirmationStatements from "./ConfirmationStatements.svelte";
import AccountsDashboard from "./AccountsDashboard.svelte";
import OrgInvite from "./OrgInvite.svelte";
import SuggestFeature from "./SuggestFeature.svelte";
import AuthedPage from "./AuthedPage.svelte";
import ManageOrg from "./ManageOrg.svelte";
import ClientList from "./ClientList.svelte";
</script>

<AuthedPage>
    <Route path="/manage-organisation">
        <ManageOrg />
    </Route>
    <Route path="/feedback">
        <SuggestFeature />
    </Route>
    <Route path="/org-invite">
        <OrgInvite />
    </Route>
    <Route path="/dashboard">
        <AccountsDashboard />
    </Route>
    <Route path="confirmation-statement-dashboard">
        <ConfirmationStatements />
    </Route>
    <Route path="/recent-filings">
        <RecentFilings />
    </Route>
    <Route path="/registered-office-address">
        <RegisteredOfficeAddress />
    </Route>
    <Route path="/clients">
        <ClientList />
    </Route>
    <Route path="/notifications">
        <Notifications />
    </Route>
</AuthedPage>
