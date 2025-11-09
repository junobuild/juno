<script lang="ts">
	import Html from '$lib/components/ui/Html.svelte';
	import Info from '$lib/components/ui/Info.svelte';
	import { i18n } from '$lib/stores/i18n.store';

	interface Props {
		warnText: string;
	}

	let { warnText }: Props = $props();
</script>

<p class="label"><Info><Html text={warnText} /></Info></p>

<a class="button" href="/">{$i18n.satellites.go_launchpad}</a>

<style lang="scss">
	p {
		margin: var(--padding-3x) 0 0;
		color: var(--value-color);
	}

	.button {
		margin: 0;
	}
</style>
