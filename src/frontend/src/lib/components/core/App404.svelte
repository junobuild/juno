<script lang="ts">
	import IconJunoLogo from '$lib/components/icons/IconJunoLogo.svelte';
	import ContainerCentered from '$lib/components/ui/ContainerCentered.svelte';
	import { authSignedIn } from '$lib/derived/auth.derived';
	import { i18n } from '$lib/stores/i18n.store';
</script>

<ContainerCentered>
	<p class="intro-404" role="presentation">
		<span>4</span><IconJunoLogo size="7.6rem" /><span>4</span><span class="visually-hidden"
			>404</span
		>
	</p>

	<h1>{$i18n.not_found.title}</h1>

	<p class="text">
		{$i18n.not_found.title}
		{$authSignedIn ? $i18n.not_found.go_launchpad_text : $i18n.not_found.go_home_text}
	</p>

	{#snippet action()}
		<a class="button" href="/"
			>{$authSignedIn ? $i18n.not_found.go_launchpad : $i18n.not_found.go_home}</a
		>
	{/snippet}
</ContainerCentered>

<style lang="scss">
	@use '../../../lib/styles/mixins/a11y';

	.intro-404 {
		display: flex;
		align-items: center;
		gap: var(--padding-4x);
		margin: 0;

		font-size: 10rem;
	}

	.text {
		max-width: 420px;
	}

	.visually-hidden {
		@include a11y.visually-hidden;
	}
</style>
