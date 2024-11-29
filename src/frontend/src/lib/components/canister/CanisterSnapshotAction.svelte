<script lang="ts">
	import Popover from '$lib/components/ui/Popover.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import IconEdit from '$lib/components/icons/IconEdit.svelte';
	import IconHistory from '$lib/components/icons/IconHistory.svelte';
	import IconRefresh from '$lib/components/icons/IconRefresh.svelte';

	interface Props {
		onrestore: () => void;
		onreplace: () => void;
	}

	let { onrestore, onreplace }: Props = $props();

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
</script>

<button
	class="square"
	bind:this={button}
	onclick={() => (visible = true)}
	aria-label={$i18n.canisters.edit_snapshot}><IconEdit size="20px" /></button
>

<Popover bind:visible anchor={button} direction="ltr">
	<div class="container">
		<button onclick={restore} class="menu"><IconHistory /> {$i18n.core.restore}</button>
		<button onclick={replace} class="menu"><IconRefresh /> {$i18n.core.replace}</button>
	</div>
</Popover>

<style lang="scss">
	@use '../../styles/mixins/overlay';

	@include overlay.popover-container;

	button {
		vertical-align: middle;
	}
</style>
