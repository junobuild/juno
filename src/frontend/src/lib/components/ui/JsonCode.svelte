<script lang="ts">
	import Json from '$lib/components/ui/Json.svelte';

	export let json: unknown | undefined = undefined;
</script>

<code>
	<Json {json} />
</code>

<style lang="scss">
	@use '../../styles/mixins/shadow';

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
</style>
