<script lang="ts">
	import { i18n } from '$lib/stores/i18n.store';
	import type {Principal} from "@dfinity/principal";
	import {isNullish} from "@dfinity/utils";
	import {toasts} from "$lib/stores/toasts.store";
	import {emit} from "$lib/utils/events.utils";

	interface Props {
		missionControlId: Principal;
	}

	let { missionControlId }: Props = $props();

	const openModal = () => {
		emit({
			message: 'junoModal',
			detail: {
				type: "create_monitoring_strategy",
				detail: {
					settings: undefined,
					missionControlId
				}
			}
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