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
import PricingPage from "./PricingPage.svelte";
import PaymentPageRouter from "./payments/PaymentPageRouter.svelte";
import PlanDependentPage from "./org/PlanDependentPage.svelte";
import {SubscriptionPlans} from '../../../fs-shared/SubscriptionPlans.js'
import {features} from "../lib/stores/features.js";
import OverviewDashboard from "./OverviewDashboard/OverviewDashboard.svelte";
</script>

<AuthedPage>

<!--    these pages require the user to be in an organisation with a subscription plan -->
    <PlanDependentPage>
        <Route path="/dashboard">
            <OverviewDashboard />
        </Route>
        <Route path="/accounts-dashboard">
            <AccountsDashboard />
        </Route>
        <Route path="confirmation-statement-dashboard">
            <ConfirmationStatements />
        </Route>
        <Route path="/recent-filings">
            <RecentFilings />
        </Route>
        <Route path="/clients">
            <ClientList />
        </Route>
            <Route path="/registered-office-address">
                {#if $features.registeredOfficeAddressChecker}
                    <RegisteredOfficeAddress />
                {:else}
                    <p>Your plan does not include the registered office address checker.</p>
                {/if}
            </Route>
    </PlanDependentPage>

    <Route path="/payments/*">
        <PaymentPageRouter/>
    </Route>
    <Route path="/manage-organisation">
        <ManageOrg />
    </Route>
    <Route path="/feedback">
        <SuggestFeature />
    </Route>
    <Route path="/org-invite">
        <OrgInvite />
    </Route>
    <Route path="/notifications">
        <Notifications />
    </Route>
</AuthedPage>
