<script lang="ts">
	import { isNullish } from '@dfinity/utils';
	import { untrack } from 'svelte';
	import WizardProgressSteps from '$lib/components/ui/WizardProgressSteps.svelte';
	import { i18n } from '$lib/stores/app/i18n.store';
	import type { ProgressStep } from '$lib/types/progress-step';
	import { type ConvertIcpProgress, ConvertIcpProgressStep } from '$lib/types/progress-convert-icp';
	import { mapProgressState } from '$lib/utils/progress.utils';

	interface Props {
		progress: ConvertIcpProgress | undefined;
	}

	let { progress }: Props = $props();

	interface Steps {
		preparing: ProgressStep;
		transfer: ProgressStep;
		mint: ProgressStep;
		reload: ProgressStep;
	}

	let steps: Steps = $state({
		preparing: {
			state: 'in_progress',
			step: 'preparing',
			text: $i18n.wallet.convert_preparing
		},
		transfer: {
			state: 'next',
			step: 'transfer',
			text: $i18n.wallet.convert_transferring
		},
		mint: {
			state: 'next',
			step: 'mint',
			text: $i18n.wallet.convert_minting
		},
		reload: {
			state: 'next',
			step: 'reload',
			text: $i18n.core.refreshing_interface
		}
	});

	let displaySteps = $derived(Object.values(steps) as [ProgressStep, ...ProgressStep[]]);

	$effect(() => {
		progress;

		untrack(() => {
			const { preparing, transfer, mint, reload } = steps;

			steps = {
				preparing: {
					...preparing,
					state: isNullish(progress) ? 'in_progress' : 'completed'
				},
				transfer: {
					...transfer,
					state:
						progress?.step === ConvertIcpProgressStep.Transfer
							? mapProgressState(progress?.state)
							: transfer.state
				},
				mint: {
					...mint,
					state:
						progress?.step === ConvertIcpProgressStep.Mint
							? mapProgressState(progress?.state)
							: mint.state
				},
				reload: {
					...reload,
					state:
						progress?.step === ConvertIcpProgressStep.Reload
							? mapProgressState(progress?.state)
							: reload.state
				}
			};
		});
	});
</script>

<WizardProgressSteps steps={displaySteps}>
	{$i18n.core.hold_tight}
</WizardProgressSteps>
