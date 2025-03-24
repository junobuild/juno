<script lang="ts">
	import { Signer } from '@dfinity/oisy-wallet-signer/signer';
	import { isNullish, nonNullish } from '@dfinity/utils';
	import {
		ICRC25_PERMISSION_GRANTED,
		ICRC25_REQUEST_PERMISSIONS,
		type IcrcScope,
		type PermissionsConfirmation,
		type PermissionsPromptPayload
	} from '@dfinity/oisy-wallet-signer';
	import { fade } from 'svelte/transition';
	import { toasts } from '$lib/stores/toasts.store';

	interface Props {
		signer: Signer | undefined;
	}

	let { signer }: Props = $props();

	let scopes = $state<IcrcScope[] | undefined | null>(undefined);
	let confirm = $state<PermissionsConfirmation | undefined | null>(undefined);

	const resetPrompt = () => {
		confirm = null;
		scopes = null;
	};

	$effect(() => {
		if (isNullish(signer)) {
			resetPrompt();
			return;
		}

		signer.register({
			method: ICRC25_REQUEST_PERMISSIONS,
			prompt: ({ confirm: confirmScopes, requestedScopes }: PermissionsPromptPayload) => {
				confirm = confirmScopes;
				scopes = requestedScopes;
			}
		});
	});

	/**
	 * During the initial UX review, it was decided that permissions should not be permanently denied when "Rejected," but instead should be ignored.
	 * This means that if the user selects "Reject," the permission will be requested again the next time a similar action is performed.
	 * This approach is particularly useful since, for the time being, there is no way for the user to manage their permissions in the Oisy UI.
	 */
	const ignorePermissions = () => {
		if (isNullish(confirm)) {
			toasts.error({
				text: '$i18n.signer.permissions.error.no_confirm_callback'
			});
			return;
		}

		confirm([]);

		resetPrompt();
	};

	const approvePermissions = () => {
		if (isNullish(confirm)) {
			toasts.error({
				text: '$i18n.signer.permissions.error.no_confirm_callback'
			});
			return;
		}

		confirm((scopes ?? []).map((scope) => ({ ...scope, state: ICRC25_PERMISSION_GRANTED })));

		resetPrompt();
	};

	const onReject = () => ignorePermissions();

	const onApprove = ($event: SubmitEvent) => {
		$event.preventDefault();

		approvePermissions();
	};
</script>

{#if nonNullish(scopes)}
	<form onsubmit={onApprove} method="POST" in:fade>
		<ul>
			{#each scopes as scope}
				<li>
					{scope.scope.method}
				</li>
			{/each}
		</ul>

		<div class="toolbar">
			<button type="button" onclick={onReject}>Reject</button>
			<button type="submit">Approve</button>
		</div>
	</form>
{/if}
