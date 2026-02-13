<script lang="ts">
    import type {Satellite} from "$lib/types/satellite";
    import {initAutomationConfigContext} from "$lib/stores/satellite/automation.context.store";
    import {setContext} from "svelte";
    import {AUTOMATION_CONFIG_CONTEXT_KEY, type AutomationConfigContext} from "$lib/types/automation.context";
    import AutomationConfigLoader from "$lib/components/automation/AutomationConfigLoader.svelte";

    interface Props {
        satellite: Satellite;
    }

    let { satellite }: Props = $props();

    let satelliteId = $derived(satellite.satellite_id);

    const { config, ...contextRest } = initAutomationConfigContext();

    setContext<AutomationConfigContext>(AUTOMATION_CONFIG_CONTEXT_KEY, { config, ...contextRest });
</script>

<AutomationConfigLoader {satellite}>
    Hello
</AutomationConfigLoader>