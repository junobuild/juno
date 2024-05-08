<script lang="ts">
	import { i18n } from '$lib/stores/i18n.store.js';
	import IconEdit from '$lib/components/icons/IconEdit.svelte';
	import Popover from '$lib/components/ui/Popover.svelte';
	import { isBusy } from '$lib/stores/busy.store';

	let visible: boolean | undefined;

	const close = () => (visible = false);

	const submit = async () => {};
</script>

<button class="menu" type="button" on:click={() => (visible = true)}
	><IconEdit size="20px" /> {$i18n.core.edit}</button
>

<Popover bind:visible center={true} backdrop="dark">
	<div class="content">
		<h3><slot name="title" /></h3>

		<p><slot /></p>

		<input type="file" />

		<div>
			<button type="button" on:click|stopPropagation={close} disabled={$isBusy}>
				{$i18n.core.cancel}
			</button>

			<button type="button" on:click|stopPropagation={submit} disabled={$isBusy}>
				{$i18n.core.submit}
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
