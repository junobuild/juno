<script lang="ts">
	import { notEmptyString } from '@dfinity/utils';
	import MonitoringStepBackContinue from '$lib/components/monitoring/MonitoringStepBackContinue.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { EMAIL_PLACEHOLDER } from '$lib/constants/monitoring.constants';
	import { isBusy } from '$lib/stores/busy.store';
	import { i18n } from '$lib/stores/i18n.store';
	import { toasts } from '$lib/stores/toasts.store';
	import { isNotValidEmail } from '$lib/utils/email.utils';

	interface Props {
		onback: () => void;
		oncontinue: (email: string | null) => void;
	}

	let { onback, oncontinue }: Props = $props();

	let email = $state('');

	const validateAndContinue = () => {
		if (notEmptyString(email) && isNotValidEmail(email ?? '')) {
			toasts.error({
				text: $i18n.errors.invalid_email
			});
			return;
		}

		oncontinue(email !== '' ? email : null);
	};
</script>

<MonitoringStepBackContinue {onback} oncontinue={validateAndContinue}>
	{#snippet header()}
		<h2>{$i18n.monitoring.email_notifications}</h2>

		<p>{$i18n.monitoring.receive_email}</p>
	{/snippet}

	<div class="input-field">
		<Value ref="mint-cycles">
			{#snippet label()}
				{$i18n.core.email_address}
			{/snippet}

			<input
				data-1p-ignore
				disabled={$isBusy}
				placeholder={EMAIL_PLACEHOLDER}
				type="email"
				bind:value={email}
			/>
		</Value>
	</div>
</MonitoringStepBackContinue>

<style lang="scss">
	.input-field {
		margin: 0 0 var(--padding);
	}
</style>
