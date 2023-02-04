<script lang="ts">
	import { authSignedInStore } from '$lib/stores/auth.store';
	import Satellites from '$lib/components/satellites/Satellites.svelte';
	import { onIntersection } from '$lib/directives/intersection.directives';
	import { onLayoutTitleIntersection } from '$lib/stores/layout.store';
	import SignIn from '$lib/components/core/SignIn.svelte';
	import Illustration from '$lib/components/presentation/Illustration.svelte';
	import { i18n } from '$lib/stores/i18n.store';
</script>

{#if $authSignedInStore}
	<h1 use:onIntersection on:junoIntersecting={onLayoutTitleIntersection}>
		{$i18n.satellites.title}
	</h1>
{/if}

<section>
	{#if $authSignedInStore}
		<Satellites />
	{:else}
		<SignIn />
	{/if}
</section>

<style lang="scss">
	@use '../../lib/styles/mixins/grid';

	section {
		@include grid.twelve-columns;

		padding: var(--padding-2x) 0;
	}
</style>
