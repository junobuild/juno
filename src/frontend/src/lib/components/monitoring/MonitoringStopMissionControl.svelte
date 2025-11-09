<script lang="ts">
	import MonitoringStepYesNo from '$lib/components/monitoring/MonitoringStepYesNo.svelte';
	import Html from '$lib/components/ui/Html.svelte';
	import { i18n } from '$lib/stores/i18n.store';

	interface Props {
		onyes: () => void;
		onno: () => void;
	}

	let { onyes, onno }: Props = $props();
</script>

<MonitoringStepYesNo {onno} {onyes}>
	<h2>{$i18n.mission_control.title}</h2>

	<p>{$i18n.monitoring.stop_monitoring_question}</p>

	<p><Html text={$i18n.monitoring.stop_monitoring_note} /></p>
</MonitoringStepYesNo>
