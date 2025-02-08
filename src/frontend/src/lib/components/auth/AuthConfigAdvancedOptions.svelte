<script lang="ts">
	import Collapsible from '$lib/components/ui/Collapsible.svelte';
	import { i18n } from '$lib/stores/i18n.store';
    import Input from "$lib/components/ui/Input.svelte";
    import Value from "$lib/components/ui/Value.svelte";

    interface Props {
        externalAlternativeOrigins: string;
    }

    let {externalAlternativeOrigins = $bindable('')}: Props = $props();
</script>

<Collapsible>
	<svelte:fragment slot="header">{$i18n.core.advanced_options}</svelte:fragment>

    <div>
        <Value>
            {#snippet label()}
                {$i18n.authentication.external_alternative_origins}
            {/snippet}

            <Input
                    inputType="text"
                    name="destination"
                    placeholder={$i18n.authentication.external_alternative_origins_placeholder}
                    bind:value={externalAlternativeOrigins}
            />
        </Value>
    </div>
</Collapsible>
