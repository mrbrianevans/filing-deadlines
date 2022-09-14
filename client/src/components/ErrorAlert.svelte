<script lang="ts">

  import {FetchError} from "../lib/swr.js";
  import {Alert, Button, SimpleGrid, Text} from "@svelteuidev/core";
  import {InfoCircled, SewingPinFilled} from "radix-icons-svelte";

  export let error: FetchError
</script>

<Alert icon={InfoCircled} title="Error: {error.name}" color="red">
    <SimpleGrid cols="{2}">
        <div>
            <Text inherit>{error.message}</Text>

            <Text color="dimmed" inherit size="xs">Error code: {error.statusCode}</Text>

        </div>
        <div>

            <Button color="red" variant="subtle" disabled>
                <SewingPinFilled slot="leftIcon"/>
                Report error
            </Button>
        </div>
    </SimpleGrid>
</Alert>


<style>

</style>
