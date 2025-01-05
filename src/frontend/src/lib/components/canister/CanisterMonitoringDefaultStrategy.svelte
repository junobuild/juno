<script lang="ts">
	import { fromNullable, nonNullish } from '@dfinity/utils';
	import { onMount } from 'svelte';
	import Checkbox from '$lib/components/ui/Checkbox.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import type { JunoModalCreateSegmentDetail, JunoModalDetail } from '$lib/types/modal';
	import { formatTCycles } from '$lib/utils/cycles.utils';
	import { i18nFormat } from '$lib/utils/i18n.utils';

	interface Props {
		detail: JunoModalDetail;
		useDefaultStrategy: boolean | undefined;
	}

	let { useDefaultStrategy = $bindable(), detail }: Props = $props();

	let { monitoringConfig } = detail as JunoModalCreateSegmentDetail;

	let monitoringStrategy = $derived(
		fromNullable(fromNullable(monitoringConfig?.cycles ?? [])?.default_strategy ?? [])
	);

	onMount(() => {
		useDefaultStrategy = nonNullish(monitoringStrategy);
	});
</script>

{#if nonNullish(useDefaultStrategy) && nonNullish(monitoringStrategy)}
	<div class="default-strategy">
		<Value>
			{#snippet label()}
				{$i18n.monitoring.auto_refill}
			{/snippet}

			<div class="group">
				<Checkbox>
					<input
						type="checkbox"
						checked={useDefaultStrategy}
						onchange={() => (useDefaultStrategy = !useDefaultStrategy)}
					/>
					<span
						>{i18nFormat($i18n.monitoring.auto_refill_strategy, [
							{
								placeholder: '{0}',
								value: formatTCycles(monitoringStrategy.BelowThreshold.min_cycles)
							},
							{
								placeholder: '{1}',
								value: formatTCycles(monitoringStrategy.BelowThreshold.fund_cycles)
							}
						])}</span
					>
				</Checkbox>
			</div>
		</Value>
	</div>
{/if}

<style lang="scss">
	.default-strategy {
		margin: var(--padding-0_5x) 0 0;
	}

	.group {
		padding: var(--padding) 0 0;
	}
</style>
