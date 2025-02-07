<script lang="ts">
	import { isNullish, nonNullish } from '@dfinity/utils';
	import { untrack } from 'svelte';
	import WizardProgressSteps from '$lib/components/ui/WizardProgressSteps.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import type { ProgressStep } from '$lib/types/progress-step';
	import { mapProgressState } from '$lib/utils/progress.utils';
	import {
		type HostingProgress,
		HostingProgressStep
	} from '$lib/types/progress-hosting';

	interface Props {
		progress: HostingProgress | undefined;
		withConfig: boolean;
	}

	let { progress, withConfig }: Props = $props();

	interface Steps {
		preparing: ProgressStep;
		customDomain: ProgressStep;
		authConfig?: ProgressStep;
	}

	let steps: Steps = $state({
		preparing: {
			state: 'in_progress',
			step: 'preparing',
			text: $i18n.core.preparing
		},
		customDomain: {
			state: 'next',
			step: 'custom-domain',
			text: $i18n.hosting.config_custom_domain_in_progress
		},
		...(withConfig && {
			authConfig: {
				state: 'next',
				step: 'auth-config',
				text: $i18n.hosting.config_auth_config_in_progress
			}
		})
	});

	let displaySteps = $derived(Object.values(steps) as [ProgressStep, ...ProgressStep[]]);

	$effect(() => {
		progress;

		untrack(() => {
			const { preparing, customDomain, authConfig } = steps;

			steps = {
				preparing: {
					...preparing,
					state: isNullish(progress) ? 'in_progress' : 'completed'
				},
				customDomain: {
					...customDomain,
					state:
						progress?.step === HostingProgressStep.CustomDomain
							? mapProgressState(progress?.state)
							: customDomain.state
				},
				...(nonNullish(authConfig) && {
					monitoring: {
						...authConfig,
						state:
							progress?.step === HostingProgressStep.AuthConfig
								? mapProgressState(progress?.state)
								: authConfig.state
					}
				})
			};
		});
	});
</script>

<WizardProgressSteps steps={displaySteps}>
	{$i18n.core.hold_tight}
</WizardProgressSteps>
