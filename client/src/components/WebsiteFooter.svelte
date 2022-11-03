<script lang="ts">

  import {Container, Footer} from "@svelteuidev/core";
  import AnchoredLink from "./AnchoredLink.svelte";
</script>

<Footer class="footer">
    <Container>
        <div class="container">
            <div>
                <h4>Filing Deadlines</h4>
                <h6>Made by Brian Evans</h6>
            </div>
            <div class="stack">
                <h6>Links</h6>
                <AnchoredLink href="/view/pricing">Pricing</AnchoredLink>
                <AnchoredLink href="/view/about">About</AnchoredLink>
                <AnchoredLink href="/view/contact">Contact</AnchoredLink>
                <AnchoredLink href="/view/how-it-works">How it works</AnchoredLink>
            </div>
            <div>
                <h6>Other</h6>
                <AnchoredLink href="/secure/feedback">Send feedback</AnchoredLink>
            </div>
        </div>

    </Container>
</Footer>

<style>
.container{
    display: grid;
    margin: 2rem 3rem 0;
    padding-bottom: 2rem;
    gap: 1rem;
    grid-template-columns: 1fr 1fr 1fr;
}

.stack{
    display: flex;
    flex-direction: column;
}

@media print{
    .container{
        display: none;
    }
}
@media screen {
    :global(.footer) {
        background: VAR(--contrast);
    }
}
</style>
