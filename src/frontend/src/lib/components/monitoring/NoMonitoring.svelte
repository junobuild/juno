<script lang="ts">
	import { compare } from 'semver';
	import { MISSION_CONTROL_v0_0_14 } from '$lib/constants/version.constants';
	import { missionControlVersion } from '$lib/derived/version.derived';
	import { loadVersion } from '$lib/services/console.services';
	import { openMonitoringModal } from '$lib/services/monitoring.services';
	import { i18n } from '$lib/stores/i18n.store';
	import { toasts } from '$lib/stores/toasts.store';
	import type { MissionControlId } from '$lib/types/mission-control';

	interface Props {
		missionControlId: MissionControlId;
	}

	let { missionControlId }: Props = $props();

	const openModal = async () => {
		await loadVersion({
			satelliteId: undefined,
			missionControlId,
			skipReload: true
		});

		if (compare($missionControlVersion?.current ?? '0.0.0', MISSION_CONTROL_v0_0_14) < 0) {
			toasts.warn($i18n.errors.monitoring_upgrade);
			return;
		}

		openMonitoringModal({
			type: 'create_monitoring_strategy',
			missionControlId
		});
	};
</script>

<div class="card-container with-title">
	<span class="title">{$i18n.core.getting_started}</span>

	<div class="content">
		<p>
			{$i18n.monitoring.introduction}
		</p>
	</div>
</div>

<button onclick={openModal}>
	{$i18n.core.get_started}
</button>

<style lang="scss">
	.card-container {
		margin: 0 0 var(--padding-2x);
	}
</style>
