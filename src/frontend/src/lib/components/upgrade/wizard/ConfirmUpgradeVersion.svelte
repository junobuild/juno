<script lang="ts">
	import type { Snippet } from 'svelte';
	import ExternalLink from '$lib/components/ui/ExternalLink.svelte';
	import Html from '$lib/components/ui/Html.svelte';
	import Warning from '$lib/components/ui/Warning.svelte';
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

<Warning --warning-icon-align-self="flex-start">
	<div>
		<p>
			<Html
				text={i18nFormat($i18n.canisters.upgrade_confirm_warning_revert, [
					{
						placeholder: '{0}',
						value: segment.replace('_', ' ')
					}
				])}
			/>
		</p>

		<p>{$i18n.canisters.upgrade_confirm_how_to}</p>

		<ul>
			<li>
				<ExternalLink href="https://juno.build/docs/build/functions/development/rust#maintenance"
					>{$i18n.canisters.rust_upgrade_guide}</ExternalLink
				>
			</li>
			<li>
				<ExternalLink
					href="https://juno.build/docs/build/functions/development/typescript#maintenance"
					>{$i18n.canisters.typescript_upgrade_guide}</ExternalLink
				>
			</li>
		</ul>
	</div>
</Warning>

<p>
	{$i18n.canisters.upgrade_confirm}
</p>

<div class="toolbar">
	<button type="button" onclick={onclose}>{$i18n.core.cancel}</button>
	<button type="button" onclick={oncontinue}>{$i18n.core.continue}</button>
</div>

<style lang="scss">
	ul {
		padding: 0 var(--padding-2_5x) var(--padding);
		margin: 0;
	}
</style>
