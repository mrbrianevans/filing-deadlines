<script lang="ts">

  import AccountsTile from "./AccountsTile.svelte";
  import RecentFilingsTile from "./RecentFilingsTile.svelte";
  import ConfirmationStatementsTile from "./ConfirmationStatementsTile.svelte";
  import RegisteredAddressTile from "./RegisteredAddressTile.svelte";
  import {Alert, Badge, Text, Title} from "@svelteuidev/core";
  import AnchoredLink from "../../components/AnchoredLink.svelte";
  import ClientsTile from "./ClientsTile.svelte";

  let checked
</script>

<div>
    <Title order={1} class="hidden-on-print" >Dashboard overview
        <Badge>Beta</Badge>
    </Title>
    <Alert class="hidden-on-print" color="blue" title="What do you think of this new feature?">
        <Text>We are trying this new dashboard to give you a quick overview of all the different data points managed by
            Filing Deadlines.
        </Text>
        <Text>Please send feedback on this feature, whether it's useful and what could be improved.</Text>
        <br/>
        <Text size="xl">
            <AnchoredLink href="/secure/feedback">Send feedback</AnchoredLink>
        </Text>

    </Alert>

    <!--    <div class="controls">-->
    <!--        <h2>Controls</h2>-->
    <!--        <label>Accounts tile expanded <input type="checkbox" bind:checked/></label>-->

    <!--    </div>-->
    <div class="dashboard">

        <div class="tile" class:expanded={checked}>
            <AccountsTile/>
        </div>
        <div class="tile">
            <ConfirmationStatementsTile/>
        </div>
        <div class="tile">
            <RecentFilingsTile/>
        </div>
        <div class="tile">
            <RegisteredAddressTile/>
        </div>
        <div class="tile">
            <ClientsTile/>
        </div>

    </div>

</div>


<style>

    .controls {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 1rem;
        box-shadow: var(--svelteui-shadows-sm);
    }

    .tile {
        padding: 1rem;
    }

    .tile.expanded {
        grid-column: span 2;
    }

    .dashboard {
        display: grid;
        grid-template-columns: 1fr 1fr;
    }

    @media screen {
        .tile {
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
        .tile {
            padding: 0.5rem;
            /*border: 1px solid black;*/
        }

        .dashboard {
            /*border: 2px solid black;*/
        }


    }

</style>
