<script lang="ts">
	import type { Snippet } from 'svelte';
	import Html from '$lib/components/ui/Html.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import { i18nFormat } from '$lib/utils/i18n.utils';

	interface Props {
		segment: 'satellite' | 'mission_control' | 'orbiter';
		intro?: Snippet;
		onclose: () => void;
		oncontinue: () => void;
	}

	let { segment, intro, onclose, oncontinue }: Props = $props();
</script>

{@render intro?.()}

<p>
	<Html
		text={i18nFormat($i18n.canisters.upgrade_confirm, [
			{
				placeholder: '{0}',
				value: segment.replace('_', ' ')
			}
		])}
	/>
</p>

<div class="toolbar">
	<button type="button" onclick={onclose}>{$i18n.core.cancel}</button>
	<button type="button" onclick={oncontinue}>{$i18n.core.continue}</button>
</div>
