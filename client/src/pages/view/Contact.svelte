<script lang="ts">
  import Contact from "../content/Contact.md";
  import {Container} from "@svelteuidev/core";
  import {links} from "svelte-navigator";
</script>

<Container size="sm">
    <div use:links>
        <Contact/>
    </div>
</Container>
