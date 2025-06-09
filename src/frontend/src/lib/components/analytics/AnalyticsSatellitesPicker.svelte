<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import SatellitesPicker, {
		type SatellitePickerProps
	} from '$lib/components/satellites/SatellitesPicker.svelte';
	import { orbiterSatellitesConfig } from '$lib/derived/orbiter-satellites.derived';
	import { navigateToAnalytics } from '$lib/utils/nav.utils';

	interface Props {
		disabled?: boolean;
	}

	let { disabled = false }: Props = $props();

	const navigate = async (satelliteId: Principal | undefined) =>
		await navigateToAnalytics(satelliteId);

    const onChange = (satelliteId: Principal | undefined) => {
        navigate(satelliteId);
    }

	let satellites = $derived(
		Object.entries($orbiterSatellitesConfig).reduce<SatellitePickerProps['satellites']>(
			(acc, [satelliteId, { name: satName, enabled }]) => [
				...acc,
				...(enabled
					? [
							{
								satelliteId,
								satName
							}
						]
					: [])
			],
			[]
		)
	);
</script>

<SatellitesPicker {disabled} {satellites} {onChange} />
