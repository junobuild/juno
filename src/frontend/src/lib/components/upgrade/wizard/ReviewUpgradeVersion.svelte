<script lang="ts">
	import { isNullish } from '@dfinity/utils';
	import Html from '$lib/components/ui/Html.svelte';
	import {
		upgrade as upgradeServices,
		type UpgradeParams
	} from '$lib/services/upgrade/upgrade.services';
	import { authStore } from '$lib/stores/auth.store';
	import { i18n } from '$lib/stores/i18n.store';
	import { i18nFormat } from '$lib/utils/i18n.utils';

	type Props = {
		segment: 'satellite' | 'mission_control' | 'orbiter';
		onclose: () => void;
	} & Omit<UpgradeParams, 'identity'>;

	let {
		upgrade,
		segment,
		wasm,
		takeSnapshot,
		canisterId,
		nextSteps,
		onProgress,
		onclose,
		reloadVersion
	}: Props = $props();

	const onSubmit = async ($event: SubmitEvent) => {
		$event.preventDefault();

		await upgradeServices({
			onProgress,
			wasm,
			upgrade,
			reloadVersion,
			nextSteps,
			takeSnapshot,
			canisterId,
			identity: $authStore.identity
		});
	};
</script>

<h2>{$i18n.canisters.review_upgrade}</h2>

{#if isNullish(wasm)}
	<p>{$i18n.errors.upgrade_no_wasm}</p>

	<div class="toolbar">
		<button onclick={() => nextSteps('init')}>{$i18n.core.back}</button>
	</div>
{:else}
	<form onsubmit={onSubmit}>
		<p>
			<Html
				text={i18nFormat($i18n.canisters.upgrade_sha, [
					{
						placeholder: '{0}',
						value: segment.replace('_', ' ')
					},
					{
						placeholder: '{1}',
						value: wasm.hash
					}
				])}
			/>
		</p>

		<p>
			{takeSnapshot
				? $i18n.canisters.confirm_upgrade_with_snapshot
				: $i18n.canisters.confirm_upgrade_without_snapshot}
		</p>

		<div class="toolbar">
			<button onclick={onclose} type="button">{$i18n.core.cancel}</button>
			<button type="submit">{$i18n.canisters.upgrade}</button>
		</div>
	</form>
{/if}
