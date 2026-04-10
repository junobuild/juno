<script lang="ts">
	import FactoryAdvancedOptions from '$lib/components/modules/factory/create/FactoryAdvancedOptions.svelte';
	import { testIds } from '$lib/constants/test-ids.constants';
	import { i18n } from '$lib/stores/app/i18n.store';
	import { testId } from '$lib/utils/test.utils';
	import type { JunoModalDetail } from '$lib/types/modal';
	import type { PrincipalText } from '@junobuild/schema';
	import type { MissionControlDid } from '$declarations';
	import { isNullish } from '@dfinity/utils';
	import Value from "$lib/components/ui/Value.svelte";

	interface Props {
		detail: JunoModalDetail;
		satelliteKind: 'website' | 'application' | undefined;
		subnetId: PrincipalText | undefined;
		monitoringStrategy: MissionControlDid.CyclesMonitoringStrategy | undefined;
		oncontinue: () => void;
		onback: () => void;
	}

	let {
		satelliteKind = $bindable(),
		detail,
		subnetId = $bindable(),
		monitoringStrategy = $bindable(),
		oncontinue,
		onback
	}: Props = $props();

	const onsubmit = ($event: SubmitEvent) => {
		$event.preventDefault();

		oncontinue();
	};

	let disabled = $derived(isNullish(satelliteKind));
</script>

<h2>{$i18n.satellites.options}</h2>

<p>{$i18n.satellites.fine_tune_config}</p>

<form {onsubmit}>
	<div class="building">
		<Value suffix="?">
			{#snippet label()}
				{$i18n.satellites.what_are_you_building}
			{/snippet}

			<div class="options">
				<label>
					<input
							name="kind"
							type="radio"
							{...testId(testIds.createSatellite.website)}
							value="website"
							bind:group={satelliteKind}
					/>
					<span class="option">
									<span>{$i18n.satellites.website}</span>
									<span>({$i18n.satellites.website_description})</span>
								</span>
				</label>

				<label>
					<input
							name="kind"
							type="radio"
							{...testId(testIds.createSatellite.application)}
							value="application"
							bind:group={satelliteKind}
					/>
					<span class="option">
									<span>{$i18n.satellites.application}</span>
									<span>({$i18n.satellites.application_description})</span>
								</span>
				</label>
			</div>
		</Value>
	</div>

	<FactoryAdvancedOptions {detail} bind:subnetId bind:monitoringStrategy />

	<div class="toolbar">
		<button onclick={onback} type="button">{$i18n.core.back}</button>

		<button {...testId(testIds.createSatellite.create)} type="submit" {disabled}>
			{$i18n.core.review}
		</button>
	</div>
</form>

<style lang="scss">
	.building {
		margin: var(--padding-2x) 0 0;
	}

	.options {
		display: flex;
		flex-direction: column;
		padding: 0 0 var(--padding);
	}

	.option {
		span:last-child {
			font-size: var(--font-size-very-small);
		}
	}

	input {
		vertical-align: middle;
	}
</style>
