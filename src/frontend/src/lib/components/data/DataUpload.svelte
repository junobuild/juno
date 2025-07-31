<script lang="ts">
	import { isNullish } from '@dfinity/utils';
	import type { Snippet } from 'svelte';
	import IconUpload from '$lib/components/icons/IconUpload.svelte';
	import Popover from '$lib/components/ui/Popover.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { isBusy } from '$lib/stores/busy.store';
	import { i18n } from '$lib/stores/i18n.store';

	interface Props {
		disabled?: boolean;
		action?: Snippet;
		title?: Snippet;
		description?: Snippet;
		children?: Snippet;
		confirm?: Snippet;
		uploadFile: (file: File | undefined) => Promise<void>;
	}

	let {
		disabled = false,
		action,
		title,
		description,
		children,
		confirm,
		uploadFile
	}: Props = $props();

	let visible: boolean = $state(false);
	const close = () => (visible = false);

	let file: File | undefined = $state(undefined);

	const onChangeFile = ($event: Event) =>
		(file = ($event as unknown as { target: EventTarget & HTMLInputElement }).target?.files?.[0]);

	let disableUpload = $derived(isNullish(file) || $isBusy || disabled);

	const upload = async ($event: UIEvent) => {
		$event.preventDefault();

		await uploadFile(file);
	};
</script>

<button class="menu" onclick={() => (visible = true)} type="button"
	><IconUpload size="20px" /> {@render action?.()}</button
>

<Popover backdrop="dark" center={true} bind:visible>
	<div class="content">
		<h3>{@render title?.()}</h3>

		<p>{@render description?.()}</p>

		<Value ref="file">
			{#snippet label()}
				{$i18n.core.file}
			{/snippet}
			<input id="file" disabled={$isBusy} onchange={onChangeFile} type="file" />
		</Value>

		{@render children?.()}

		<div>
			<button disabled={$isBusy} onclick={close} type="button">
				{$i18n.core.cancel}
			</button>

			<button disabled={disableUpload} onclick={upload} type="button">
				{@render confirm?.()}
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
