<script lang="ts">
	import { isNullish } from '@dfinity/utils';
	import {
		type UpgradeCodeProgress,
		type UpgradeCodeProgressState,
		UpgradeCodeProgressStep
	} from '@junobuild/admin';
	import { untrack } from 'svelte';
	import ProgressSteps from '$lib/components/ui/ProgressSteps.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import type { ProgressStep, ProgressStepState } from '$lib/types/progress-step';
	import { i18nFormat } from '$lib/utils/i18n.utils';

	interface Props {
		segment: 'satellite' | 'mission_control' | 'orbiter';
		progress: UpgradeCodeProgress | undefined;
	}

	let { progress, segment }: Props = $props();

	const progressState = (state: UpgradeCodeProgressState | undefined): ProgressStepState => {
		switch (state) {
			case 'error':
				return 'error';
			case 'success':
				return 'completed';
			case 'in_progress':
				return 'in_progress';
			default:
				return 'next';
		}
	};

	interface Steps {
		preparing: ProgressStep;
		asserting: ProgressStep;
		stopping: ProgressStep;
		upgrading: ProgressStep;
		restarting: ProgressStep;
	}

	let steps: Steps = $state({
		preparing: {
			state: 'in_progress',
			step: 'preparing',
			text: $i18n.canisters.upgrade_preparing
		},
		asserting: {
			state: 'next',
			step: 'asserting',
			text: $i18n.canisters.upgrade_validating
		},
		stopping: {
			state: 'next',
			step: 'stopping',
			text: i18nFormat($i18n.canisters.upgrade_stopping, [
				{
					placeholder: '{0}',
					value: segment
				}
			])
		},
		upgrading: {
			state: 'next',
			step: 'upgrading',
			text: $i18n.canisters.upgrade_in_progress
		},
		restarting: {
			state: 'next',
			step: 'restarting',
			text: i18nFormat($i18n.canisters.upgrade_restarting, [
				{
					placeholder: '{0}',
					value: segment
				}
			])
		}
	});

	let displaySteps = $derived(Object.values(steps) as [ProgressStep, ...ProgressStep[]]);

	$effect(() => {
		progress;

		untrack(() => {
			const { preparing, asserting, stopping, upgrading, restarting } = steps;

			steps = {
				preparing: {
					...preparing,
					state: isNullish(progress) ? 'in_progress' : 'completed'
				},
				asserting: {
					...asserting,
					state:
						progress?.step === UpgradeCodeProgressStep.AssertingExistingCode
							? progressState(progress?.state)
							: asserting.state
				},
				stopping: {
					...stopping,
					state:
						progress?.step === UpgradeCodeProgressStep.StoppingCanister
							? progressState(progress?.state)
							: stopping.state
				},
				upgrading: {
					...upgrading,
					state:
						progress?.step === UpgradeCodeProgressStep.UpgradingCode
							? progressState(progress?.state)
							: upgrading.state
				},
				restarting: {
					...restarting,
					state:
						progress?.step === UpgradeCodeProgressStep.RestartingCanister
							? progressState(progress?.state)
							: restarting.state
				}
			};
		});
	});
</script>

<h2>{$i18n.canisters.upgrade_progress_title}</h2>

<div>
	<ProgressSteps steps={displaySteps} />
</div>

<style lang="scss">
	div {
		margin: var(--padding-4x) 0;
	}
</style>
