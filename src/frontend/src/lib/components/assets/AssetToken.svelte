<script lang="ts">
	import { fromNullable, isNullish } from '@dfinity/utils';
	import { setAssetToken } from '@junobuild/core';
	import { getContext } from 'svelte';
	import type { SatelliteDid } from '$declarations';
	import IconLockOpen from '$lib/components/icons/IconLockOpen.svelte';
	import InputGenerate from '$lib/components/ui/InputGenerate.svelte';
	import Popover from '$lib/components/ui/Popover.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { authIdentity } from '$lib/derived/auth.derived';
	import { busy, isBusy } from '$lib/stores/app/busy.store';
	import { i18n } from '$lib/stores/app/i18n.store';
	import { toasts } from '$lib/stores/app/toasts.store';
	import { RULES_CONTEXT_KEY, type RulesContext } from '$lib/types/rules.context';
	import { container } from '$lib/utils/juno.utils';

	interface Props {
		asset: SatelliteDid.AssetNoContent;
		onsettokensuccess: () => void;
	}

	let { asset, onsettokensuccess }: Props = $props();

	// svelte-ignore state_referenced_locally
	let token = $state<string | undefined>(fromNullable(asset.key.token));

	const { store }: RulesContext = getContext<RulesContext>(RULES_CONTEXT_KEY);

	let satelliteId = $derived($store.satelliteId);

	let visible: boolean = $state(false);
	const close = () => (visible = false);

	// Use UUID - longer than nanoid - for better protection
	const generateToken = () => (token = window.crypto.randomUUID());

	const apply = async () => {
		if (isNullish($authIdentity)) {
			toasts.error({
				text: $i18n.authentication.not_signed_in
			});
			return;
		}

		busy.start();

		try {
			await setAssetToken({
				fullPath: asset.key.full_path,
				collection: asset.key.collection,
				token: token ?? null,
				satellite: {
					satelliteId: satelliteId.toText(),
					identity: $authIdentity,
					...container()
				}
			});

			onsettokensuccess();
		} catch (err: unknown) {
			toasts.error({
				text: $i18n.errors.set_asset_token_error,
				detail: err
			});
		} finally {
			busy.stop();
		}
	};
</script>

<button class="menu" onclick={() => (visible = true)} type="button"
	><IconLockOpen size="20px" /> {$i18n.asset.token_edit}</button
>

<Popover backdrop="dark" center={true} bind:visible>
	<div class="content">
		<h3>{$i18n.asset.token_edit}</h3>

		<p>{$i18n.asset.token_edit_description}</p>

		<Value ref="token">
			{#snippet label()}
				{$i18n.asset.token}
			{/snippet}

			<InputGenerate
				generate={generateToken}
				generateLabel={$i18n.asset.token_generate}
				inputPlaceholder={$i18n.asset.token_description}
				bind:inputValue={token}
			/>
		</Value>

		<div>
			<button disabled={$isBusy} onclick={close} type="button">
				{$i18n.core.cancel}
			</button>

			<button disabled={$isBusy} onclick={apply} type="button">
				{$i18n.core.apply}
			</button>
		</div>
	</div>
</Popover>

<style lang="scss">
	.content {
		padding: var(--padding-2x);
		max-width: 100%;
	}

	h3 {
		margin-bottom: var(--padding-2x);
	}

	p {
		white-space: initial;
		word-break: break-word;
	}
</style>
