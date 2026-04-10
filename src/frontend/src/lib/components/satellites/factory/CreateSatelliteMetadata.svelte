<script lang="ts">
	import { testId } from '$lib/utils/test.utils';
	import { testIds } from '$lib/constants/test-ids.constants';
	import Value from '$lib/components/ui/Value.svelte';
	import { i18n } from '$lib/stores/app/i18n.store';
	import { isEmptyString } from '@dfinity/utils';

	interface Props {
		satelliteName: string | undefined;
		oncontinue: () => void;
	}

	let { satelliteName = $bindable(), oncontinue }: Props = $props();

	const onsubmit = ($event: SubmitEvent) => {
		$event.preventDefault();

		oncontinue();
	};

	let disabled = $derived(isEmptyString(satelliteName));
</script>

<form {onsubmit}>
	<Value>
		{#snippet label()}
			{$i18n.satellites.satellite_name}
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

	<button {...testId(testIds.createSatellite.create)} type="submit" {disabled}>
		{$i18n.core.continue}
	</button>
</form>

<style lang="scss">
	button {
		margin-top: var(--padding-2x);
	}
</style>
