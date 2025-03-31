<script lang="ts">
	import { getContext } from 'svelte';
	import { fade } from 'svelte/transition';
	import { SIGNER_CONTEXT_KEY, type SignerContext } from '$lib/stores/signer.store';
	import { toasts } from '$lib/stores/toasts.store';
	import SpinnerParagraph from '$lib/components/ui/SpinnerParagraph.svelte';

	const {
		callCanisterPrompt: { payload }
	} = getContext<SignerContext>(SIGNER_CONTEXT_KEY);

	const onPayload = () => {
		if ($payload?.status !== 'error') {
			return;
		}

		// TODO: i18n
		toasts.error({
			text: '$i18n.signer.call_canister.error.cannot_call',
			detail: $payload.details
		});
	};

	$effect(() => {
		$payload;

		onPayload();
	});
</script>

{#if $payload?.status === 'executing'}
	<SpinnerParagraph>Executing call...</SpinnerParagraph>
{:else if $payload?.status === 'result'}
	<p in:fade>Success ✅</p>
{:else if $payload?.status === 'error'}
	<p in:fade>Error 🥲</p>
{/if}
