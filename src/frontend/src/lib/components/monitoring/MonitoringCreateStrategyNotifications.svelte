<script lang="ts">
	import MonitoringStepBackContinue from '$lib/components/monitoring/MonitoringStepBackContinue.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import { isBusy } from '$lib/stores/busy.store';
	import { toasts } from '$lib/stores/toasts.store';
	import { isNotValidEmail } from '$lib/utils/email.utils';
	import { notEmptyString } from '@dfinity/utils';

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
	<h2>{$i18n.monitoring.email_notifications}</h2>

	<p>{$i18n.monitoring.receive_email}</p>

	<div class="input-field">
		<Value ref="mint-cycles">
			{#snippet label()}
				{$i18n.core.email_address}
			{/snippet}

			<input type="email" bind:value={email} placeholder="name@example.com" disabled={$isBusy} />
		</Value>
	</div>
</MonitoringStepBackContinue>

<style lang="scss">
	.input-field {
		margin: 0 0 var(--padding);
	}
</style>
