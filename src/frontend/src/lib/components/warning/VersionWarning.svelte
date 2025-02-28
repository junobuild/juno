<script lang="ts">
	import IconNewReleases from '$lib/components/icons/IconNewReleases.svelte';
	import Html from '$lib/components/ui/Html.svelte';
	import { onIntersection } from '$lib/directives/intersection.directives';
	import { i18n } from '$lib/stores/i18n.store';
	import { onLayoutTitleIntersection } from '$lib/stores/layout-intersecting.store';

	interface Props {
		text: string;
		onclick: () => Promise<void>;
	}

	let { text, onclick }: Props = $props();
</script>

<div class="container" use:onIntersection onjunoIntersecting={onLayoutTitleIntersection}>
	<div class="icon"><IconNewReleases /></div>

	<div>
		<p><Html {text} /></p>

		<button class="primary" {onclick}>{$i18n.canisters.upgrade}</button>
	</div>
</div>

<style lang="scss">
	@use '../../styles/mixins/info';

	.container {
		@include info.warning;

		button {
			@include info.warning-button;
		}
	}

	p {
		margin: 0 0 var(--padding-1_5x);
	}

	button {
		margin: 0 0 var(--padding-0_5x);
	}

	.icon {
		min-width: var(--padding-4x);
	}
</style>
