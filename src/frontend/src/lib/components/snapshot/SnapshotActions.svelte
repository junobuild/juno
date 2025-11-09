<script lang="ts">
	import IconDelete from '$lib/components/icons/IconDelete.svelte';
	import IconEdit from '$lib/components/icons/IconEdit.svelte';
	import IconHistory from '$lib/components/icons/IconHistory.svelte';
	import IconRefresh from '$lib/components/icons/IconRefresh.svelte';
	import Popover from '$lib/components/ui/Popover.svelte';
	import { i18n } from '$lib/stores/i18n.store';

	interface Props {
		onrestore: () => void;
		onreplace: () => void;
		ondelete: () => void;
	}

	let { onrestore, onreplace, ondelete }: Props = $props();

	let visible = $state(false);

	let button: HTMLButtonElement | undefined = $state();

	const restore = () => {
		onrestore();
		visible = false;
	};

	const replace = () => {
		onreplace();
		visible = false;
	};

	const deleteSnapshot = () => {
		ondelete();
		visible = false;
	};
</script>

<button
	bind:this={button}
	class="square"
	aria-label={$i18n.canisters.edit_snapshot}
	onclick={() => (visible = true)}><IconEdit size="20px" /></button
>

<Popover anchor={button} direction="ltr" bind:visible>
	<div class="container">
		<button class="menu" onclick={restore}><IconHistory /> {$i18n.core.restore}</button>
		<button class="menu" onclick={replace}><IconRefresh /> {$i18n.core.replace}</button>
		<button class="menu" onclick={deleteSnapshot}><IconDelete /> {$i18n.core.delete}</button>
	</div>
</Popover>

<style lang="scss">
	@use '../../styles/mixins/overlay';

	@include overlay.popover-container;

	button {
		vertical-align: middle;
	}
</style>
