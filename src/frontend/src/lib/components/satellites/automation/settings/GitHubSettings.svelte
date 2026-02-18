<script lang="ts">
	import { i18n } from '$lib/stores/app/i18n.store';
    import type {Satellite} from "$lib/types/satellite";
    import type {SatelliteDid} from "$declarations";

    interface Props {
        satellite: Satellite;
        config: SatelliteDid.OpenIdAutomationProviderConfig
    }

    let { satellite, config }: Props = $props();
    
    
</script>

<div class="card-container with-title">
	<span class="title">GitHub</span>

	<div class="columns-3 fit-column-1">
		<div>
			<p>{$i18n.automation.description}</p>
		</div>
	</div>
</div>
