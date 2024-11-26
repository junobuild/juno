<script lang="ts">
	import { UpgradeCodeProgress } from '@junobuild/admin';
	import SpinnerModal from '$lib/components/ui/SpinnerModal.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import { i18nFormat } from '$lib/utils/i18n.utils';

	interface Props {
		segment: 'satellite' | 'mission_control' | 'orbiter';
		progress: UpgradeCodeProgress | undefined;
	}

	let { progress, segment }: Props = $props();
</script>

<SpinnerModal>
	{#if progress === UpgradeCodeProgress.AssertingExistingCode}
		<p>{$i18n.canisters.upgrade_validating}</p>
	{:else if progress === UpgradeCodeProgress.StoppingCanister}
		<p>
			{i18nFormat($i18n.canisters.upgrade_stopping, [
				{
					placeholder: '{0}',
					value: segment
				}
			])}
		</p>
	{:else if progress === UpgradeCodeProgress.RestartingCanister}
		<p>
			{i18nFormat($i18n.canisters.upgrade_restarting, [
				{
					placeholder: '{0}',
					value: segment
				}
			])}
		</p>
	{:else}
		<p>{$i18n.canisters.upgrade_in_progress}</p>
	{/if}
</SpinnerModal>
