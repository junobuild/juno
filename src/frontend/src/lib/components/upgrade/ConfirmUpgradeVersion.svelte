<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import Html from '$lib/components/ui/Html.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import { i18nFormat } from '$lib/utils/i18n.utils';

	export let segment: 'satellite' | 'mission_control' | 'orbiter';

	const dispatch = createEventDispatcher();
</script>

<slot name="intro" />

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
	<button type="button" on:click={() => dispatch('junoClose')}>{$i18n.core.cancel}</button>
	<button type="button" on:click={() => dispatch('junoContinue')}>{$i18n.core.continue}</button>
</div>
