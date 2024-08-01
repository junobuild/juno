<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import IconUpload from '$lib/components/icons/IconUpload.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import { isBusy } from '$lib/stores/busy.store';
	import Popover from '$lib/components/ui/Popover.svelte';
	import { isNullish } from '@dfinity/utils';
	import Value from '$lib/components/ui/Value.svelte';

	export let disabled = false;

	let visible: boolean | undefined;
	const close = () => (visible = false);

	let file: File | undefined = undefined;

	const onChangeFile = ($event: Event) =>
		(file = ($event as unknown as { target: EventTarget & HTMLInputElement }).target?.files?.[0]);

	let disableUpload = true;
	$: disableUpload = isNullish(file) || $isBusy || disabled;

	const dispatch = createEventDispatcher();
	const upload = () => dispatch('junoUpload', file);
</script>

<button class="menu" type="button" on:click={() => (visible = true)}
	><IconUpload size="20px" /> <slot name="action" /></button
>

<Popover bind:visible center={true} backdrop="dark">
	<div class="content">
		<h3><slot name="title" /></h3>

		<p><slot name="description" /></p>

		<Value ref="file">
			<svelte:fragment slot="label">{$i18n.core.file}</svelte:fragment>
			<input id="file" type="file" on:change={onChangeFile} disabled={$isBusy} />
		</Value>

		<slot />

		<div>
			<button type="button" on:click|stopPropagation={close} disabled={$isBusy}>
				{$i18n.core.cancel}
			</button>

			<button type="button" on:click|stopPropagation={upload} disabled={disableUpload}>
				{$i18n.asset.upload}
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
