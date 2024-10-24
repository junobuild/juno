<script lang="ts">
	import { isNullish } from '@dfinity/utils';
	import { createEventDispatcher, type Snippet } from 'svelte';
	import { run, stopPropagation } from 'svelte/legacy';
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
		children: Snippet;
		confirm?: Snippet;
	}

	let { disabled = false, action, title, description, children, confirm }: Props = $props();

	let visible: boolean = $state(false);
	const close = () => (visible = false);

	let file: File | undefined = $state(undefined);

	const onChangeFile = ($event: Event) =>
		(file = ($event as unknown as { target: EventTarget & HTMLInputElement }).target?.files?.[0]);

	let disableUpload = $state(true);
	run(() => {
		disableUpload = isNullish(file) || $isBusy || disabled;
	});

	const dispatch = createEventDispatcher();
	const upload = () => dispatch('junoUpload', file);
</script>

<button class="menu" type="button" onclick={() => (visible = true)}
	><IconUpload size="20px" /> {@render action?.()}</button
>

<Popover bind:visible center={true} backdrop="dark">
	<div class="content">
		<h3>{@render title?.()}</h3>

		<p>{@render description?.()}</p>

		<Value ref="file">
			{#snippet label()}
				{$i18n.core.file}
			{/snippet}
			<input id="file" type="file" onchange={onChangeFile} disabled={$isBusy} />
		</Value>

		{@render children()}

		<div>
			<button type="button" onclick={stopPropagation(close)} disabled={$isBusy}>
				{$i18n.core.cancel}
			</button>

			<button type="button" onclick={stopPropagation(upload)} disabled={disableUpload}>
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
