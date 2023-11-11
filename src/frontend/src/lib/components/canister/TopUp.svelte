<script lang="ts">
	import { emit } from '$lib/utils/events.utils';
	import type { JunoModalDetail } from '$lib/types/modal';
	import { busy } from '$lib/stores/busy.store';
	import { missionControlStore } from '$lib/stores/mission-control.store';
	import { isNullish, nonNullish } from '@dfinity/utils';
	import { i18n } from '$lib/stores/i18n.store';
	import { getMissionControlBalance } from '$lib/services/balance.services';

	export let type: 'topup_satellite' | 'topup_mission_control' | 'topup_orbiter';
	export let detail: JunoModalDetail | undefined = undefined;

	const topUp = async () => {
		busy.start();

		const { result, error } = await getMissionControlBalance($missionControlStore);

		busy.stop();

		if (nonNullish(error) || isNullish(result)) {
			return;
		}

		emit({
			message: 'junoModal',
			detail: {
				type,
				detail: {
					...(nonNullish(detail) && detail),
					missionControlBalance: {
						...result
					}
				}
			}
		});
	};
</script>

<button on:click={topUp}>{$i18n.canisters.top_up}</button>

<style lang="scss">
	button {
		margin: var(--padding-2x) 0 0;
	}
</style>
