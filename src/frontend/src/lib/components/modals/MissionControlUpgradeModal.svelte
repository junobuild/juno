<script lang="ts">
	import { nonNullish } from '$lib/utils/utils';
	import { missionControlStore } from '$lib/stores/mission-control.store';
	import { i18nFormat } from '$lib/utils/i18n.utils';
	import { i18n } from '$lib/stores/i18n.store';
	import CanisterUpgradeModal from '$lib/components/modals/CanisterUpgradeModal.svelte';
</script>

{#if nonNullish($missionControlStore)}
	<CanisterUpgradeModal on:junoClose>
		<svelte:fragment slot="intro">
			<h2>
				{@html i18nFormat($i18n.canisters.upgrade_title, [
					{
						placeholder: '{0}',
						value: 'mission control center'
					}
				])}
			</h2>
		</svelte:fragment>
	</CanisterUpgradeModal>
{/if}
