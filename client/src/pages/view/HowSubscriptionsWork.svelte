<script lang="ts">
  import HowSubscriptionsWork from "../content/HowSubscriptionsWork.md";
  import {Container} from "@svelteuidev/core";
  import {links} from "svelte-navigator";
</script>

<Container size="sm">
    <div use:links>
        <HowSubscriptionsWork/>
    </div>
</Container>
