<script lang="ts">

  import AccountsTile from "./AccountsTile.svelte";
  import RecentFilingsTile from "./RecentFilingsTile.svelte";
  import ConfirmationStatementsTile from "./ConfirmationStatementsTile.svelte";
  import RegisteredAddressTile from "./RegisteredAddressTile.svelte";
  import {Badge, NumberInput, Title, Switch, ActionIcon, Group} from "@svelteuidev/core";
  import ClientsTile from "./ClientsTile.svelte";
  import {Height, Reload, Width} from "radix-icons-svelte";
  import {dashboardData} from "../../lib/stores/dashboardData.js";
  import OverviewDashboardTile from "./OverviewDashboardTile.svelte";
  import {confirmationStatements} from "../../lib/stores/confirmationStatements.js";
  import {orgAddress} from "../../lib/stores/orgAddress.js";

  const {processing: accountsProcessing} = dashboardData
  const {processing: confirmationStatementsProcessing} = confirmationStatements
  let accountsTall = true, accountsWide = false
  let confirmationStatementsTall = false
  // these config values should be persisted in localStorage
</script>

<div>
    <Title order={1} class="hidden-on-print" >Dashboard overview
        <Badge>Beta</Badge>
    </Title>

<!--        <div class="controls hidden-on-print">-->
<!--            <Switch bind:checked={accountsTall} label="Accounts tile expanded"/>-->
<!--        </div>-->
    <div class="dashboard">

        <OverviewDashboardTile title="Accounts deadlines" description="Upcoming accounts deadlines for your clients."
                               linkUrl="/secure/accounts-dashboard" linkDisplay="View full dashboard"
                               on:refresh={()=>{dashboardData.refresh()}} loading={$accountsProcessing}
                               bind:tall={accountsTall} bind:wide={accountsWide}
        >
            <AccountsTile limit={accountsTall ? 10 : 5}/>
        </OverviewDashboardTile>

        <OverviewDashboardTile title="Confirmation statement deadlines" description="Upcoming confirmation statement deadlines for your clients."
                               linkUrl="/secure/confirmation-statement-dashboard" linkDisplay="View full dashboard"
                               on:refresh={()=>{confirmationStatements.refresh()}} loading={$confirmationStatementsProcessing}
                               bind:tall={confirmationStatementsTall}
        >
            <ConfirmationStatementsTile limit={confirmationStatementsTall ? 10 : 5}/>
        </OverviewDashboardTile>

        <OverviewDashboardTile title="Recent filings" description="Filings in the last 7 days for companies on your client list."
                               linkUrl="/secure/recent-filings" linkDisplay="View recent filings" showRefresh={false}
                               footnotes={["This counts all filings for companies on your client list, including any filings made by third parties, in the last 7 days."]}
        >
            <RecentFilingsTile/>
        </OverviewDashboardTile>
        <OverviewDashboardTile title="Registered office address" description="{$orgAddress?.addressLine1} {$orgAddress?.postCode}"
                               linkUrl="/secure/registered-office-address" linkDisplay="View full list" showRefresh={false}
                               footnotes={["These counts are based on a search at Companies House with your postcode and optionally first line of address, and may not be perfectly accurate."]}
        >
            <RegisteredAddressTile/>
        </OverviewDashboardTile>
        <OverviewDashboardTile title="Clients"
                               linkUrl="/secure/clients" linkDisplay="View client list" showRefresh={false}
                               footnotes={["This counts all filings for companies on your client list, including any filings made by third parties, in the last 7 days."]}
        >
            <ClientsTile/>
        </OverviewDashboardTile>
    </div>

</div>


<style>

    .controls {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 1rem;
    }

    .dashboard {
        display: grid;
        grid-template-columns: 1fr 1fr;
    }

    @media screen {
        .dashboard>* {
            border-radius: 10px;
            box-shadow: var(--svelteui-shadows-sm);
        }

        .dashboard {
            gap: 1rem;
        }
    }

    @media screen and (max-width: 700px) {
        .dashboard {
            grid-template-columns: 1fr;
        }
    }

    @media print and (orientation: landscape) {
        .dashboard {
            grid-template-columns: 1fr 1fr;
        }
    }

    @media print and (orientation: portrait) {
        .dashboard {
            grid-template-columns: 1fr;
        }
    }

    @media print {
        .dashboard>* {
            padding: 0.5rem;
            /*border: 1px solid black;*/
        }

        .dashboard {
            /*border: 2px solid black;*/
        }


    }

</style>
