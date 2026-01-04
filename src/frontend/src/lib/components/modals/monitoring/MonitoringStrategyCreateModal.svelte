<script lang="ts">
	import { nonNullish, notEmptyString, fromNullishNullable } from '@dfinity/utils';
	import type { Principal } from '@icp-sdk/core/principal';
	import type { MissionControlDid } from '$declarations';
	import MonitoringCreateSelectStrategy from '$lib/components/monitoring/MonitoringCreateSelectStrategy.svelte';
	import MonitoringCreateStrategy from '$lib/components/monitoring/MonitoringCreateStrategy.svelte';
	import MonitoringCreateStrategyMissionControl from '$lib/components/monitoring/MonitoringCreateStrategyMissionControl.svelte';
	import MonitoringCreateStrategyNotifications from '$lib/components/monitoring/MonitoringCreateStrategyNotifications.svelte';
	import MonitoringCreateStrategyReview from '$lib/components/monitoring/MonitoringCreateStrategyReview.svelte';
	import MonitoringCreateStrategyWithDefault from '$lib/components/monitoring/MonitoringCreateStrategyWithDefault.svelte';
	import MonitoringSelectSegments from '$lib/components/monitoring/MonitoringSelectSegments.svelte';
	import ProgressMonitoring from '$lib/components/monitoring/ProgressMonitoring.svelte';
	import MonitoringCreateWizard from '$lib/components/monitoring/create/MonitoringCreateWizard.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import { authIdentity } from '$lib/derived/auth.derived';
	import {
		applyMonitoringCyclesStrategy,
		type ApplyMonitoringCyclesStrategyOptions
	} from '$lib/services/mission-control/monitoring.services';
	import { wizardBusy } from '$lib/stores/app/busy.store';
	import { i18n } from '$lib/stores/app/i18n.store';
	import type { JunoModalDetail, JunoModalCreateMonitoringStrategyDetail } from '$lib/types/modal';
	import type { MonitoringStrategyProgress } from '$lib/types/progress-strategy';
	import type { Option } from '$lib/types/utils';
	import { metadataEmail } from '$lib/utils/metadata.utils';

	interface Props {
		detail: JunoModalDetail;
		onclose: () => void;
	}

	let { detail, onclose }: Props = $props();

	let { settings, user, missionControlId } = $derived(
		detail as JunoModalCreateMonitoringStrategyDetail
	);

	let onback = $state<(() => void) | undefined>();
</script>

<Modal {onback} {onclose}>
	<MonitoringCreateWizard {missionControlId} {onclose} {settings} {user} bind:onback />
</Modal>
