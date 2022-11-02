<script lang="ts">

  import {Anchor, Container, Text, Title} from "@svelteuidev/core";
  import AnchoredLink from "../../components/AnchoredLink.svelte";
  import {ExternalLink} from "radix-icons-svelte";
</script>


<Container>
    <Title order={2}>About filing deadlines</Title>
    <p>
        Filing Deadlines was started in September 2022, as a way for accountants to view upcoming deadlines for all their clients.
        Originally, it was just designed to show deadlines from Companies House.
        Over time, more features have been added which make use of other data from Companies House.
    </p>

    <p>
        All of the source code for Filing Deadlines is publicly available at <Anchor external href="https://github.com/mrbrianevans/filing-deadlines">filing-deadlines <ExternalLink/></Anchor> on GitHub.
    </p>

    <Title order={2}>About me</Title>
    <p>
        The website was started and is maintained by me, Brian Evans.
        I have done a lot of work extracting data from the Companies House datasets in recent years.
    </p>

    <p>
        I am a software developer living in the town of Somerton, Somerset.
    </p>

    <p>
        If you have any specific requirements for getting bulk data from Companies House,
        please get in touch as I can probably help you out.
    </p>

    <p>I have a personal website at <Anchor external href="https://brianevans.tech">brianevans.tech<ExternalLink/></Anchor> which shows some of the other projects I've worked on.</p>
</Container>


<style>

</style>
