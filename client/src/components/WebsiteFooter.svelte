<script lang="ts">

  import {Container, Footer} from "@svelteuidev/core";
  import AnchoredLink from "./AnchoredLink.svelte";
</script>

<Footer override={{bc: '#0001'}}>
    <Container>
        <div class="container">
            <h6>Made by Brian Evans</h6>
            <div>
                <h6>Links</h6>
                <AnchoredLink href="/view/pricing">Pricing</AnchoredLink>
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
</style>
