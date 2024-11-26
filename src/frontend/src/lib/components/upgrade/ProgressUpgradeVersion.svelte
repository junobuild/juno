<script lang="ts">
	import { UpgradeCodeProgress } from '@junobuild/admin';
	import SpinnerModal from '$lib/components/ui/SpinnerModal.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import { i18nFormat } from '$lib/utils/i18n.utils';
	import type { ProgressStep } from '$lib/types/progress-step';
	import ProgressSteps from '$lib/components/ui/ProgressSteps.svelte';

	interface Props {
		segment: 'satellite' | 'mission_control' | 'orbiter';
		progress: UpgradeCodeProgress | undefined;
	}

	let { progress, segment }: Props = $props();

	let steps: [ProgressStep, ...ProgressStep[]] = $derived([
		{
			state: progress === undefined ? 'in_progress' : 'completed',
			step: 'preparing',
			text: $i18n.canisters.upgrade_preparing
		},
		{
			state:
				progress === undefined
					? 'next'
					: progress === UpgradeCodeProgress.AssertingExistingCode
						? 'in_progress'
						: 'completed',
			step: 'asserting',
			text: $i18n.canisters.upgrade_validating
		},
		{
			state:
				progress === undefined || progress <= UpgradeCodeProgress.AssertingExistingCode
					? 'next'
					: progress === UpgradeCodeProgress.StoppingCanister
						? 'in_progress'
						: 'completed',
			step: 'stopping',
			text: i18nFormat($i18n.canisters.upgrade_stopping, [
				{
					placeholder: '{0}',
					value: segment
				}
			])
		},
		{
			state:
				progress === undefined || progress <= UpgradeCodeProgress.StoppingCanister
					? 'next'
					: progress === UpgradeCodeProgress.UpgradingCode
						? 'in_progress'
						: 'completed',
			step: 'upgrading',
			text: $i18n.canisters.upgrade_in_progress
		},
		{
			state:
				progress === undefined || progress <= UpgradeCodeProgress.UpgradingCode
					? 'next'
					: progress === UpgradeCodeProgress.RestartingCanister
						? 'in_progress'
						: 'completed',
			step: 'restarting',
			text: i18nFormat($i18n.canisters.upgrade_restarting, [
				{
					placeholder: '{0}',
					value: segment
				}
			])
		}
	]);
</script>

<h2>{$i18n.canisters.upgrade_progress_title}</h2>

<div>
	<ProgressSteps {steps} />
</div>

<style lang="scss">
	div {
		margin: var(--padding-4x) 0;
	}
</style>
