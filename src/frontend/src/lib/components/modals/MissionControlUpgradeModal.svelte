<script lang="ts">
	import { nonNullish } from '$lib/utils/utils';
	import { missionControlStore } from '$lib/stores/mission-control.store';
	import { i18nFormat } from '$lib/utils/i18n.utils';
	import { i18n } from '$lib/stores/i18n.store';
	import CanisterUpgradeModal from '$lib/components/modals/CanisterUpgradeModal.svelte';
	import type { JunoModalDetail, JunoModalUpgradeSatelliteDetail } from '$lib/types/modal';
	import type { GitHubRelease } from '@junobuild/admin';

	export let detail: JunoModalDetail;

	let newerReleases: GitHubRelease[];

	$: ({ newerReleases } = detail as JunoModalUpgradeSatelliteDetail);
</script>

{#if nonNullish($missionControlStore)}
	<CanisterUpgradeModal on:junoClose {newerReleases} assetKey="mission_control">
		<svelte:fragment slot="intro">
			<h2>
				{@html i18nFormat($i18n.canisters.upgrade_title, [
					{
						placeholder: '{0}',
						value: 'mission control center'
					}
				])}
			</h2>

			<p>{$i18n.canisters.upgrade_note}</p>

			<p>
				{@html i18nFormat($i18n.canisters.upgrade_description, [
					{
						placeholder: '{0}',
						value: 'mission control center'
					}
				])}
			</p>
		</svelte:fragment>
	</CanisterUpgradeModal>
{/if}
