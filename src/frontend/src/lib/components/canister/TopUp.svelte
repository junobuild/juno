<script lang="ts">
	import { isNullish, nonNullish } from '@dfinity/utils';
	import { getAccountIdentifier } from '$lib/api/icp-index.api';
	import { missionControlId } from '$lib/derived/account.mission-control.derived';
	import { i18n } from '$lib/stores/i18n.store';
	import { toasts } from '$lib/stores/toasts.store';
	import type { JunoModalWithSatellite } from '$lib/types/modal';
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

		const accountIdentifier = getAccountIdentifier($missionControlId);

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
