<script lang="ts">
	import { isNullish, nonNullish } from '@dfinity/utils';
	import { untrack } from 'svelte';
	import WizardProgressSteps from '$lib/components/ui/WizardProgressSteps.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import { type HostingProgress, HostingProgressStep } from '$lib/types/progress-hosting';
	import type { ProgressStep } from '$lib/types/progress-step';
	import { mapProgressState } from '$lib/utils/progress.utils';

	interface Props {
		progress: HostingProgress | undefined;
		withConfig: boolean;
	}

	let { progress, withConfig }: Props = $props();

	interface Steps {
		preparing: ProgressStep;
		setup: ProgressStep;
		validate: ProgressStep;
		register: ProgressStep;
		authConfig?: ProgressStep;
	}

	let steps: Steps = $state({
		preparing: {
			state: 'in_progress',
			step: 'preparing',
			text: $i18n.core.preparing
		},
		setup: {
			state: 'next',
			step: 'setup-custom-domain',
			text: $i18n.hosting.setup_custom_domain_in_progress
		},
		validate: {
			state: 'next',
			step: 'validate-custom-domain',
			text: $i18n.hosting.validate_custom_domain_in_progress
		},
		register: {
			state: 'next',
			step: 'register-custom-domain',
			text: $i18n.hosting.register_custom_domain_in_progress
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
			const { preparing, setup, validate, register, authConfig } = steps;

			steps = {
				preparing: {
					...preparing,
					state: isNullish(progress) ? 'in_progress' : 'completed'
				},
				setup: {
					...setup,
					state:
						progress?.step === HostingProgressStep.Setup
							? mapProgressState(progress?.state)
							: setup.state
				},
				validate: {
					...validate,
					state:
						progress?.step === HostingProgressStep.Validate
							? mapProgressState(progress?.state)
							: validate.state
				},
				register: {
					...register,
					state:
						progress?.step === HostingProgressStep.Register
							? mapProgressState(progress?.state)
							: register.state
				},
				...(nonNullish(authConfig) && {
					authConfig: {
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
