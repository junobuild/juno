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

	let satellites = $derived<SatellitePickerProps['satellites']>(
		Object.entries($orbiterSatellitesConfig).reduce(
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
			// eslint-disable-next-line @typescript-eslint/prefer-reduce-type-parameter
			[] as { satelliteId: string; satName: string }[]
		)
	);
</script>

<SatellitesPicker {disabled} {satellites} {navigate} />
