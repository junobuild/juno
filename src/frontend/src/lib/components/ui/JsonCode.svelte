<script lang="ts">
	import Json from '$lib/components/ui/Json.svelte';

	interface Props {
		json?: unknown | undefined;
	}

	let { json = undefined }: Props = $props();
</script>

<code>
	<Json {json} />
</code>

<style lang="scss">
	@use '../../styles/mixins/shadow';
	@use '../../styles/mixins/media';

	code {
		display: block;

		padding: var(--padding-2x);
		margin: 0 var(--padding) 0 0;

		@include shadow.shadow;

		background: var(--color-card-contrast);
		color: var(--color-card);

		border-radius: var(--border-radius);

		font-size: var(--font-size-very-small);
	}

	@include media.dark-theme {
		code {
			background: var(--color-background);
			color: var(--color-background-contrast);
		}
	}
</style>
