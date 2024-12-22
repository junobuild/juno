<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import { isNullish } from '@dfinity/utils';
	import { orbiterNotLoaded, orbiterStore } from '$lib/derived/orbiter.derived';
	import { satellitesNotLoaded, satellitesStore } from '$lib/derived/satellite.derived';
	import { openMonitoringModal } from '$lib/services/monitoring.services';
	import { i18n } from '$lib/stores/i18n.store';
	import { toasts } from '$lib/stores/toasts.store';
	import { emit } from '$lib/utils/events.utils';

	interface Props {
		missionControlId: Principal;
	}

	let { missionControlId }: Props = $props();

	const openModal = () => {
		openMonitoringModal({
			type: 'create_monitoring_strategy',
			missionControlId
		});
	};
</script>

<div class="card-container with-title">
	<span class="title">{$i18n.monitoring.start}</span>

	<div class="content">
		<p>
			{$i18n.monitoring.introduction}
		</p>
	</div>
</div>

<button onclick={openModal}>
	{$i18n.monitoring.start_monitoring}
</button>
