<script lang="ts">
	import { isNullish } from '@dfinity/utils';
	import { untrack } from 'svelte';
	import WizardProgressSteps from '$lib/components/ui/WizardProgressSteps.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import { type SendTokensProgress, SendTokensProgressStep } from '$lib/types/progress-send-tokens';
	import type { ProgressStep } from '$lib/types/progress-step';
	import { mapProgressState } from '$lib/utils/progress.utils';

	interface Props {
		progress: SendTokensProgress | undefined;
	}

	let { progress }: Props = $props();

	interface Steps {
		preparing: ProgressStep;
		send: ProgressStep;
		reload: ProgressStep;
	}

	let steps: Steps = $state({
		preparing: {
			state: 'in_progress',
			step: 'preparing',
			text: $i18n.wallet.preparing_send
		},
		send: {
			state: 'next',
			step: 'send',
			text: $i18n.wallet.sending_in_progress
		},
		reload: {
			state: 'next',
			step: 'reload',
			text: $i18n.canisters.loading_ui_data
		}
	});

	let displaySteps = $derived(Object.values(steps) as [ProgressStep, ...ProgressStep[]]);

	$effect(() => {
		progress;

		untrack(() => {
			const { preparing, send, reload } = steps;

			steps = {
				preparing: {
					...preparing,
					state: isNullish(progress) ? 'in_progress' : 'completed'
				},
				send: {
					...send,
					state:
						progress?.step === SendTokensProgressStep.Send
							? mapProgressState(progress?.state)
							: send.state
				},
				reload: {
					...reload,
					state:
						progress?.step === SendTokensProgressStep.Reload
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
