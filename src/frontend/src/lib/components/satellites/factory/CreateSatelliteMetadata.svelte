<script lang="ts">
	import { isEmptyString } from '@dfinity/utils';
	import Value from '$lib/components/ui/Value.svelte';
	import { testIds } from '$lib/constants/test-ids.constants';
	import { i18n } from '$lib/stores/app/i18n.store';
	import { testId } from '$lib/utils/test.utils';

	interface Props {
		satelliteName: string | undefined;
		oncontinue: () => void;
		onback: () => void;
	}

	let { satelliteName = $bindable(), oncontinue, onback }: Props = $props();

	const onsubmit = ($event: SubmitEvent) => {
		$event.preventDefault();

		oncontinue();
	};

	let disabled = $derived(isEmptyString(satelliteName));
</script>

<h2>{$i18n.satellites.get_started}</h2>

<p>{$i18n.satellites.choose_name}</p>

<form {onsubmit}>
	<Value>
		{#snippet label()}
			{$i18n.core.name}
		{/snippet}
		<input
			name="satellite_name"
			autocomplete="off"
			data-1p-ignore
			{...testId(testIds.createSatellite.input)}
			placeholder={$i18n.satellites.enter_name}
			required
			type="text"
			bind:value={satelliteName}
		/>
	</Value>

	<div class="toolbar">
		<button onclick={onback} type="button">{$i18n.core.back}</button>

		<button {...testId(testIds.createSatellite.continueToOptions)} {disabled} type="submit">
			{$i18n.core.continue}
		</button>
	</div>
</form>

<style lang="scss">
	button {
		margin-top: var(--padding-2x);
	}
</style>
