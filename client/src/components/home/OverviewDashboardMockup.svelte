<script lang="ts">

    import Stat from "../Stat.svelte";

    let daysUntilMonthEnd = 31 - new Date().getDate()
</script>

<div class="container">
    <div>
        <h3>Accounts</h3>
        <table class="no-breaks">
            <tr><th>Client name</th> <th>Due</th></tr>
            <tr><td>Bob's Bakery LTD</td> <td>{daysUntilMonthEnd} days</td></tr>
            <tr><td>Rental Properties LTD</td> <td>{daysUntilMonthEnd} days</td></tr>
            <tr><td>Wright Partners LLP</td> <td>{daysUntilMonthEnd+30} days</td></tr>
        </table>
    </div>
    <div>
        <h3>Confirmation statements</h3>
        <p>Upcoming deadlines</p>
        <table class="no-breaks">
            <tr><th>Client name</th> <th>Due</th></tr>
            <tr><td>Joinery LTD</td> <td>{4} days</td></tr>
        </table>
    </div>
    <div>
        <h3>Recent filings</h3>
        <Stat label="Accounts filed this month" data="9" tooltip={false}/>
    </div>
    <div>
        <h3>Registered office address</h3>
        <Stat label="Companies using your office address" data="193" tooltip={false}/>
    </div>
</div>


<style>

    .container{
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.5rem;
        height: 100%;
    }

    .container>div{
        background: VAR(--contrast);
        border-radius: 5px;
        padding: 1rem;
    }
    .container h3{
        margin: 0;
        padding: 0;
        font-size: 1.2rem;
    }
    .container p{
        font-size: 0.8rem;
    }

    table.no-breaks *{
        white-space: nowrap;
        overflow: clip;
        text-overflow: ellipsis;
    }
</style>
