<script lang="ts">
	import { fromNullable, nonNullish } from '@dfinity/utils';
	import type { SatelliteDid } from '$declarations';
	import Value from '$lib/components/ui/Value.svelte';
	import { AUTOMATION_DEFAULT_MAX_SESSION_TIME_TO_LIVE } from '$lib/constants/automation.constants';
	import {
		AN_HOUR_NS,
		FIFTEEN_MINUTES_NS,
		FIVE_MINUTES_NS,
		FORTY_FIVE_MINUTES_NS,
		TEN_MINUTES_NS,
		THIRTY_MINUTES_NS,
		TWO_MINUTES_NS
	} from '$lib/constants/duration.constants';
	import { i18n } from '$lib/stores/app/i18n.store';
	import { secondsToDuration } from '$lib/utils/date.utils';

	interface Props {
		config: SatelliteDid.OpenIdAutomationProviderConfig;
		openModal: (params: {
			type: 'edit_automation_keys_config' | 'edit_automation_add_repository_config';
		}) => void;
	}

	let { config, openModal }: Props = $props();

	let controller = $derived(fromNullable(config?.controller));

	let controllerScope = $derived(fromNullable(controller?.scope ?? []));
	let scope = $derived(
		nonNullish(controllerScope) && 'Submit' in controllerScope ? 'submit' : 'write'
	);

	let maxTimeToLive = $derived(
		fromNullable(controller?.max_time_to_live ?? []) ?? AUTOMATION_DEFAULT_MAX_SESSION_TIME_TO_LIVE
	);

	const openEditModal = () => openModal({ type: 'edit_automation_keys_config' });
</script>

<div class="card-container with-title">
	<span class="title">{$i18n.automation.keys}</span>

	<div class="columns-3 fit-column-1">
		<div>
			<div>
				<Value>
					{#snippet label()}
						{$i18n.controllers.scope}
					{/snippet}

					<p>{scope === 'submit' ? $i18n.controllers.submit : $i18n.controllers.write}</p>
				</Value>
			</div>
		</div>

		<div>
			<div>
				<Value>
					{#snippet label()}
						{$i18n.automation.access_duration}
					{/snippet}

					<p>
						{#if maxTimeToLive === BigInt(TWO_MINUTES_NS)}
							{$i18n.core.two_minutes}
						{:else if maxTimeToLive === BigInt(FIVE_MINUTES_NS)}
							{$i18n.core.five_minutes}
						{:else if maxTimeToLive === BigInt(TEN_MINUTES_NS)}
							{$i18n.core.ten_minutes}
						{:else if maxTimeToLive === BigInt(FIFTEEN_MINUTES_NS)}
							{$i18n.core.fifteen_minutes}
						{:else if maxTimeToLive === BigInt(THIRTY_MINUTES_NS)}
							{$i18n.core.thirty_minutes}
						{:else if maxTimeToLive === BigInt(FORTY_FIVE_MINUTES_NS)}
							{$i18n.core.forty_five_minutes}
						{:else if maxTimeToLive === BigInt(AN_HOUR_NS)}
							{$i18n.core.an_hour}
						{:else}
							{secondsToDuration(maxTimeToLive ?? 0n)}
						{/if}
					</p>
				</Value>
			</div>
		</div>
	</div>
</div>

<button onclick={openEditModal}>{$i18n.core.configure}</button>
