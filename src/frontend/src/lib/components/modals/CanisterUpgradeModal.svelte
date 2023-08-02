<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import Modal from '$lib/components/ui/Modal.svelte';
	import SpinnerModal from '$lib/components/ui/SpinnerModal.svelte';
	import type { GitHubRelease, NewerReleasesAssetKey } from '@junobuild/admin';
	import SelectUpgradeVersion from "$lib/components/upgrade/SelectUpgradeVersion.svelte";

	export let currentVersion: string;
	export let newerReleases: GitHubRelease[];
	export let assetKey: NewerReleasesAssetKey;

	let steps: 'init' | 'download' | 'review' | 'in_progress' | 'ready' | 'error' = 'init';

	const dispatch = createEventDispatcher();
	const close = () => dispatch('junoClose');


</script>

<Modal on:junoClose>
	{#if steps === 'ready'}
		<div class="msg">
			<slot name="outro" />
			<button on:click={close}>{$i18n.core.close}</button>
		</div>
	{:else if steps === 'download'}
		<SpinnerModal>
			<p>{$i18n.canisters.download_in_progress}</p>
		</SpinnerModal>
	{:else if steps === 'in_progress'}
		<SpinnerModal>
			<p>{$i18n.canisters.upgrade_in_progress}</p>
		</SpinnerModal>
	{:else}
		<SelectUpgradeVersion {newerReleases} {assetKey} {currentVersion} on:junoNext={({ detail }) => (steps = detail)}>
			<slot name="intro" slot="intro" />
		</SelectUpgradeVersion>
	{/if}
</Modal>
