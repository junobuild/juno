<script lang="ts">
	import InputIcp from '$lib/components/core/InputIcp.svelte';
	import Html from '$lib/components/ui/Html.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import { toasts } from '$lib/stores/toasts.store';
	import { i18nFormat } from '$lib/utils/i18n.utils';
	import { invalidIcpAddress } from '$lib/utils/icp-account.utils';
	import { formatICP } from '$lib/utils/icp.utils';
	import { invalidIcrcAddress } from '$lib/utils/icrc-account.utils';
	import { assertAndConvertAmountToICPToken } from '$lib/utils/token.utils';

	interface Props {
		balance: bigint | undefined;
		destination?: string;
		amount: string | undefined;
		onreview: () => void;
	}

	let { balance, destination = $bindable(''), amount = $bindable(), onreview }: Props = $props();

	const onSubmit = ($event: SubmitEvent) => {
		$event.preventDefault();

		if (invalidIcrcAddress(destination) && invalidIcpAddress(destination)) {
			toasts.error({
				text: $i18n.errors.invalid_destination
			});
			return;
		}

		const { valid } = assertAndConvertAmountToICPToken({
			balance,
			amount
		});

		if (!valid) {
			return;
		}

		onreview();
	};
</script>

<h2>{$i18n.wallet.send}</h2>

<p>
	<Html
		text={i18nFormat($i18n.wallet.send_information, [
			{
				placeholder: '{0}',
				value: formatICP(balance ?? 0n)
			}
		])}
	/>
</p>

<form class="content" onsubmit={onSubmit}>
	<div>
		<Value>
			{#snippet label()}
				{$i18n.wallet.destination}
			{/snippet}

			<Input
				name="destination"
				inputType="text"
				placeholder={$i18n.wallet.destination_placeholder}
				bind:value={destination}
			/>
		</Value>
	</div>

	<InputIcp {balance} bind:amount />

	<button class="action" type="submit">
		{$i18n.core.review}
	</button>
</form>

<style lang="scss">
	@use '../../styles/mixins/media';
	@use '../../styles/mixins/grid';

	form {
		margin: var(--padding-4x) 0;

		@include media.min-width(large) {
			@include grid.two-columns;
		}
	}

	button {
		margin-top: var(--padding);
	}
</style>
