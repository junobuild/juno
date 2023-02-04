<script lang="ts">
	import Article from '$lib/components/ui/Article.svelte';
	import { emit } from '$lib/utils/events.utils';
	import IconNew from '$lib/components/icons/IconNew.svelte';
	import IconSatellite from '$lib/components/icons/IconSatellite.svelte';
	import { i18n } from '$lib/stores/i18n.store';
</script>

<Article on:click={() => emit({ message: 'junoModal', detail: { type: 'create_satellite' } })}>
	<div class="new">
		<IconNew size="48px" />

		<p>{$i18n.satellites.launch}</p>
	</div>
</Article>

<style lang="scss">
	@use '../../styles/mixins/fonts';

	.new {
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;

		gap: var(--padding-4x);

		height: 100%;

		color: var(--color-primary);
	}

	p {
		@include fonts.bold(true);

		color: var(--text-color);
		max-width: 150px;
		text-align: center;

		margin: 0;
	}
</style>
