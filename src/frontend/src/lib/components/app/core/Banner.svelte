<script lang="ts">
	import IconSpaceStation from '$lib/components/icons/IconSpaceStation.svelte';
	import IconWarning from '$lib/components/icons/IconWarning.svelte';
	import Html from '$lib/components/ui/Html.svelte';
	import { i18n } from '$lib/stores/app/i18n.store';

	interface Props {
		display: 'dev' | 'maintenance';
	}

	let { display }: Props = $props();
</script>

<aside class="banner" class:warn={display === 'maintenance'}>
	{#if display === 'dev'}
		<IconSpaceStation /> <strong>Dev Console</strong>
	{:else}
		<IconWarning size="18" /> <Html text={$i18n.core.maintenance}></Html>
	{/if}
</aside>

<style lang="scss">
	.banner {
		height: var(--banner-height);

		background: var(--color-tertiary);
		color: var(--color-tertiary-contrast);

		display: flex;
		justify-content: center;
		align-items: center;

		gap: var(--padding);

		&.warn {
			background: var(--color-warning);
			color: var(--color-warning-contrast);
		}
	}
</style>
