<script lang="ts">
	import { isNullish } from '@dfinity/utils';
	import { untrack } from 'svelte';
	import WizardProgressSteps from '$lib/components/ui/WizardProgressSteps.svelte';
	import { i18n } from '$lib/stores/app/i18n.store';
	import { type OutOfSyncProgress, OutOfSyncProgressStep } from '$lib/types/progress-out-of-sync';
	import type { ProgressStep } from '$lib/types/progress-step';
	import { mapProgressState } from '$lib/utils/progress.utils';

	interface Props {
		progress: OutOfSyncProgress | undefined;
		syncProgressText?: string;
	}

	let { progress, syncProgressText }: Props = $props();

	interface Steps {
		preparing: ProgressStep;
		sync: ProgressStep;
		reload: ProgressStep;
	}

	let defaultSyncProgressText = $derived(`${$i18n.out_of_sync.syncing_modules}...`);

	// svelte-ignore state_referenced_locally
	let steps: Steps = $state({
		preparing: {
			state: 'in_progress',
			step: 'preparing',
			text: $i18n.core.preparing
		},
		sync: {
			state: 'next',
			step: 'sync',
			text: syncProgressText ?? defaultSyncProgressText
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
			const { preparing, sync, reload } = steps;

			steps = {
				preparing: {
					...preparing,
					state: isNullish(progress) ? 'in_progress' : 'completed'
				},
				sync: {
					...sync,
					state:
						progress?.step === OutOfSyncProgressStep.Sync
							? mapProgressState(progress?.state)
							: sync.state
				},
				reload: {
					...reload,
					state:
						progress?.step === OutOfSyncProgressStep.Reload
							? mapProgressState(progress?.state)
							: reload.state
				}
			};
		});
	});

	$effect(() => {
		syncProgressText;

		untrack(() => {
			const { preparing, sync, reload } = steps;

			steps = {
				preparing,
				sync: {
					...sync,
					text: syncProgressText ?? defaultSyncProgressText
				},
				reload
			};
		});
	});
</script>

<WizardProgressSteps steps={displaySteps}>
	{$i18n.core.hold_tight}
</WizardProgressSteps>
