<script lang="ts">
	import SplitPane from '$lib/components/ui/SplitPane.svelte';

	export let centered = false;
</script>

<SplitPane>
	<slot name="menu" slot="menu" />

	<div class="content">
		<slot name="navbar" />

		<div class="page">
			<main class:centered>
				<slot />
			</main>

			<slot name="footer" />
		</div>
	</div>
</SplitPane>

<style lang="scss">
	@use '../../styles/mixins/media';

	.content {
		position: relative;
		width: 100%;
		min-width: 100%;

		@include media.min-width(large) {
			min-width: auto;
		}
	}

	.page {
		height: 100vh;
		overflow-y: auto;

		padding: var(--header-height) 0 0;
	}

	main {
		max-width: media.$breakpoint-extra-large;

		padding: 0 var(--padding-4x) var(--padding-4x) var(--padding-2x);

		position: relative;
		min-height: calc(100% - var(--footer-height));

		@include media.min-width(xlarge) {
			padding: 0 var(--padding-10x) var(--padding-2x);
		}
	}

	.centered {
		margin: 0 auto;
	}
</style>
