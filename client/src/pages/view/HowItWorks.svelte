<script lang="ts">

  import {Container, Text, Title} from "@svelteuidev/core";
</script>


<Container>
    <Title order={2}>Deadline dashboards (accounts and confirmation statements)</Title>
    <p>
        The data for the accounts and confirmation statements dashboards is fetched from Companies House public data REST API for the companies in your client list.
        Companies House notifies the website electronically when there is a change to any company, and that's how it stays up-to-date.
        It can sometimes take companies house some time (~30min) to process changes before they will reflect on the dashboard.
    </p>

    <Title order={2}>Recent filings</Title>
    <p>
        A history of filings for the companies on your client list is kept.
        It starts when you add a new client with the 25 most recent filings, and then whenever a new filing is created, it gets added.
    </p>
    <Title order={2}>Notifications</Title>
    <p>
        This feature is optional, and switched off by default.
        When a new filing is made at Companies House, they notify this website automatically which triggers a notification
        to any users who have notifications switched on and have that company in their client list.

        These notifications are specific to the web browser you use (eg Firefox, Chrome, Edge etc).
        In order to receive them, your web browser must be open. If your browser is closed when a notification is sent,
        it will show the next time you open your browser.
        If you sign in from another device you won't get notifications there automatically.
        You can only enable notifications for a single device. If you enable them on a new device, it will override your previous device notifications preference.
    </p>


    <Title order={2}>Registered office address</Title>
    <p>
        This feature allows you to see all the companies who have a certain registered office address.
        It does this by performing an advanced search at Companies House by location.
        It may not always be perfectly accurate because sometimes the same address can be written differently.
        It searches by postcode, but there may be other registered addresses in the same postcode.
        For best results, try put your full postcode and the first line of your address.
    </p>

    <Title order={2}>Anything else</Title>
    <p>
        If you would like to know how any other feature of the website works, or if you're curious of more detail than
        whats given here, feel free to get in contact.
    </p>
</Container>


<style>

</style>
