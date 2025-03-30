<script lang="ts">
	import { isNullish, nonNullish } from '@dfinity/utils';
	import {
		ICRC25_PERMISSION_GRANTED,
		ICRC27_ACCOUNTS,
		type IcrcScopedMethod,
	} from '@dfinity/oisy-wallet-signer';
	import { fade } from 'svelte/transition';
	import { toasts } from '$lib/stores/toasts.store';
	import { type Component, getContext } from 'svelte';
	import { SIGNER_CONTEXT_KEY, type SignerContext } from '$lib/stores/signer.store';
	import { i18n } from '$lib/stores/i18n.store';
	import IconWallet from '$lib/components/icons/IconWallet.svelte';
	import IconShield from '$lib/components/icons/IconShield.svelte';
	import SignerOrigin from '$lib/components/signer/SignerOrigin.svelte';
	import { shortenWithMiddleEllipsis } from '$lib/utils/format.utils';
	import type { MissionControlId } from '$lib/types/mission-control';

	interface Props {
		missionControlId: MissionControlId;
	}

	let { missionControlId }: Props = $props();

	const {
		permissionsPrompt: { payload, reset: resetPrompt }
	} = getContext<SignerContext>(SIGNER_CONTEXT_KEY);

	let scopes = $derived($payload?.requestedScopes ?? []);

	let confirm = $derived($payload?.confirm);

	/**
	 * During the initial UX review of OISY, it was decided that permissions should not be permanently denied when "Rejected," but instead should be ignored.
	 * This means that if the user selects "Reject," the permission will be requested again the next time a similar action is performed.
	 * This approach is particularly useful since, for the time being, there is no way for the user to manage their permissions in the Oisy UI.
	 */
	const ignorePermissions = () => {
		if (isNullish(confirm)) {
			toasts.error({
				text: $i18n.signer.permissions_no_confirm_callback
			});
			return;
		}

		confirm([]);

		resetPrompt();
	};

	const approvePermissions = () => {
		if (isNullish(confirm)) {
			toasts.error({
				text: $i18n.signer.permissions_no_confirm_callback
			});
			return;
		}

		confirm(scopes.map((scope) => ({ ...scope, state: ICRC25_PERMISSION_GRANTED })));

		resetPrompt();
	};

	const onReject = () => ignorePermissions();

	const onApprove = () => approvePermissions();

	let listItems: Record<IcrcScopedMethod, { icon: Component; label: string }> = $derived({
		icrc27_accounts: {
			icon: IconWallet,
			label: $i18n.signer.permissions_icrc27_accounts
		},
		icrc49_call_canister: {
			icon: IconShield,
			label: $i18n.signer.permissions_icrc49_call_canister
		}
	});

	let requestAccountsPermissions = $derived(
		nonNullish(scopes.find(({ scope: { method } }) => method === ICRC27_ACCOUNTS))
	);
</script>

{#if nonNullish($payload)}
	<form in:fade onsubmit={onApprove} method="POST">
		<SignerOrigin payload={$payload} />

		<div class="warning">
			<p>{$i18n.signer.permissions_requested_permissions}</p>

			<ul>
				{#each scopes as { scope: { method } } (method)}
					{@const { icon: Icon, label } = listItems[method]}

					<li>
						<Icon size="24" />
						{label}
					</li>
				{/each}
			</ul>
		</div>

		{#if requestAccountsPermissions}
			<p>
				<label for="ic-wallet-address">{$i18n.signer.permissions_your_wallet_address}:</label>

				<output id="ic-wallet-address"
					>{shortenWithMiddleEllipsis(missionControlId.toText())}</output
				>
			</p>
		{/if}

		<div class="toolbar">
			<button type="button" onclick={onReject}>Reject</button>
			<button type="submit">Approve</button>
		</div>
	</form>
{/if}

<style lang="scss">
	@use '../../styles/mixins/info';

	.warning {
		@include info.warning;
	}
</style>
