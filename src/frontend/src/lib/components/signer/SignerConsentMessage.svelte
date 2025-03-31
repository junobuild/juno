<script lang="ts">
	import type {
		ConsentMessageApproval,
		ConsentMessagePromptPayload,
		Rejection,
		ResultConsentInfo
	} from '@dfinity/oisy-wallet-signer';
	import { isNullish, nonNullish } from '@dfinity/utils';
	import { getContext } from 'svelte';
	import { SIGNER_CONTEXT_KEY, type SignerContext } from '$lib/stores/signer.store';
	import { toasts } from '$lib/stores/toasts.store';
	import SpinnerParagraph from '$lib/components/ui/SpinnerParagraph.svelte';
	import { fade } from 'svelte/transition';
	import SignerOrigin from '$lib/components/signer/SignerOrigin.svelte';
	import SignerConsentMessageWarning from '$lib/components/signer/SignerConsentMessageWarning.svelte';
	import JsonCode from '$lib/components/ui/JsonCode.svelte';

	const {
		consentMessagePrompt: { payload, reset: resetPrompt },
		callCanisterPrompt: { reset: resetCallCanisterPrompt }
	} = getContext<SignerContext>(SIGNER_CONTEXT_KEY);

	let approve = $derived<ConsentMessageApproval | undefined>(
		nonNullish($payload) && $payload.status === 'result' ? $payload.approve : undefined
	);
	let reject = $derived<Rejection | undefined>(
		nonNullish($payload) && $payload.status === 'result' ? $payload.reject : undefined
	);
	let consentInfo = $derived<ResultConsentInfo | undefined>(
		nonNullish($payload) && $payload.status === 'result' ? $payload.consentInfo : undefined
	);

	let loading = $state(false);
	let displayMessage = $state<string | undefined>(undefined);

	const onPayload = () => {
		if ($payload?.status === 'loading') {
			displayMessage = undefined;
			loading = true;

			// In case the relying party has not closed the window between the last call and requesting a new call, we reset the call canister prompt; otherwise, we might display both the previous result screen and the consent message.
			// Note that the library handles the case where the relying party tries to submit another call while a call is still being processed. Therefore, we cannot close a prompt here that is not yet finished.
			resetCallCanisterPrompt();

			return;
		}

		loading = false;

		if ($payload?.status === 'error') {
			// TODO: i18n
			toasts.error({
				text: '$i18n.signer.consent_message.error.retrieve'
			});
			return;
		}

		const consentInfoMsg = nonNullish(consentInfo)
			? 'Warn' in consentInfo
				? consentInfo.Warn.consentInfo
				: consentInfo.Ok
			: undefined;

		displayMessage =
			nonNullish(consentInfoMsg) && 'GenericDisplayMessage' in consentInfoMsg.consent_message
				? consentInfoMsg.consent_message.GenericDisplayMessage
				: undefined;
	};

	$effect(() => {
		$payload;

		onPayload();
	});

	type Text = { title: string; content: string } | undefined;

	// We try to split the content and title because we received a chunk of unstructured text from the canister. This works well for the ICP ledger, but we will likely need to iterate on it. There are a few tasks documented in the backlog.
	const mapText = (markdown: string | undefined): Text => {
		if (isNullish(markdown)) {
			return undefined;
		}

		const [title, ...rest] = markdown.split('\n');

		return {
			title: title.replace(/^#+\s*/, '').trim(),
			content: (rest ?? []).join('\n')
		};
	};

	let text = $derived<Text>(mapText(displayMessage));

	const onApprove = ($event: SubmitEvent) => {
		$event.preventDefault();

		if (isNullish(approve)) {
			// TODO: i18n
			toasts.error({
				text: '$i18n.signer.consent_message.error.no_approve_callback'
			});

			resetPrompt();
			return;
		}

		approve?.();
		resetPrompt();
	};

	const onReject = () => {
		if (isNullish(reject)) {
			// TODO: i18n
			toasts.error({
				text: '$i18n.signer.consent_message.error.no_reject_callback'
			});

			resetPrompt();
			return;
		}

		reject();
		resetPrompt();
	};
</script>

{#if loading}
	<SpinnerParagraph>$i18n.signer.consent_message.text.loading</SpinnerParagraph>
{:else if nonNullish(text)}
	{@const { title, content } = text}

	<form in:fade onsubmit={onApprove} method="POST">
		<p>{title}</p>

		<SignerOrigin payload={$payload} />

		<SignerConsentMessageWarning {consentInfo} />

		<JsonCode json={content}></JsonCode>

		<div class="toolbar">
			<button type="button" onclick={onReject}>Reject</button>
			<button type="submit">Approve</button>
		</div>
	</form>
{/if}
