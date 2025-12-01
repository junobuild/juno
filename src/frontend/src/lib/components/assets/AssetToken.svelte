<script lang="ts">
	import IconLockOpen from '$lib/components/icons/IconLockOpen.svelte';
	import Popover from '$lib/components/ui/Popover.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import type { SatelliteDid } from '$declarations';
	import {fromNullable, isNullish} from '@dfinity/utils';
	import InputGenerate from '$lib/components/ui/InputGenerate.svelte';
	import {busy, isBusy} from "$lib/stores/busy.store";
	import {toasts} from "$lib/stores/toasts.store";
	import {authStore} from "$lib/stores/auth.store";

	interface Props {
		asset: SatelliteDid.AssetNoContent;
	}

	let { asset }: Props = $props();

	let token = $state<string | undefined>(fromNullable(asset.key.token));

	let visible: boolean = $state(false);
	const close = () => (visible = false);

	// Use UUID - longer than nanoid - for better protection
	const generateToken = () => (token = window.crypto.randomUUID());

	const apply = async () => {
		if (isNullish($authStore.identity)) {
			toasts.error({
				text: $i18n.authentication.not_signed_in
			});
			return;
		}

		busy.start();

		try {

		}
	}
</script>

<button class="menu" onclick={() => (visible = true)} type="button"
	><IconLockOpen size="20px" /> {$i18n.asset.token_edit}</button
>

<Popover backdrop="dark" center={true} bind:visible>
	<div class="content">
		<h3>{$i18n.asset.token}</h3>

		<p>{$i18n.asset.token_edit_description}</p>

		<p>
			<InputGenerate
				generate={generateToken}
				generateLabel={$i18n.asset.token_generate}
				inputPlaceholder={$i18n.asset.token_description}
				bind:inputValue={token}
			/>
		</p>

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
