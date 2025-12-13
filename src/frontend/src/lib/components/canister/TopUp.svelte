<script lang="ts">
	import { isNullish, nonNullish } from '@dfinity/utils';
	import { missionControlId } from '$lib/derived/console/account.mission-control.derived';
	import { i18n } from '$lib/stores/app/i18n.store';
	import { toasts } from '$lib/stores/app/toasts.store';
	import type { JunoModalWithSatellite } from '$lib/types/modal';
	import { toAccountIdentifier } from '$lib/utils/icp-icrc-account.utils';
	import { emit } from '$lib/utils/events.utils';

	interface Props {
		type: 'topup_satellite' | 'topup_mission_control' | 'topup_orbiter';
		detail?: JunoModalWithSatellite | undefined;
		onclose: () => void;
	}

	let { type, onclose, detail = undefined }: Props = $props();

	const topUp = () => {
		onclose();

		if (isNullish($missionControlId)) {
			toasts.error({
				text: $i18n.errors.no_mission_control
			});
			return;
		}

		const accountIdentifier = toAccountIdentifier({ owner: $missionControlId });

		emit({
			message: 'junoModal',
			detail: {
				type,
				detail: {
					...(nonNullish(detail) && detail),
					accountIdentifier
				}
			}
		});
	};
</script>

<button onclick={topUp}>{$i18n.canisters.top_up}</button>
