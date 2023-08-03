<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import Modal from '$lib/components/ui/Modal.svelte';
	import SpinnerModal from '$lib/components/ui/SpinnerModal.svelte';
	import SelectUpgradeVersion from '$lib/components/upgrade/SelectUpgradeVersion.svelte';
	import type { Wasm } from '$lib/types/upgrade';
	import ReviewUpgradeVersion from "$lib/components/upgrade/ReviewUpgradeVersion.svelte";

	export let currentVersion: string;
	export let newerReleases: string[];
	export let segment: 'satellite' | 'mission_control';

	let steps: 'init' | 'download' | 'review' | 'in_progress' | 'ready' | 'error' = 'init';

	const dispatch = createEventDispatcher();
	const close = () => dispatch('junoClose');

	let wasm: Wasm | undefined;

	const onSelect = ({
		detail: {
			steps: s,
			wasm: w
		}
	}: CustomEvent<{
		steps: 'review' | 'error' | 'download';
		wasm: Wasm;
	}>) => {
		wasm = w;
		steps = s;
	};
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
	{:else if steps === 'review'}
		<ReviewUpgradeVersion {wasm} {segment} on:junoNext={({ detail }) => (steps = detail)} on:junoClose />
	{:else}
		<SelectUpgradeVersion {newerReleases} {segment} {currentVersion} on:junoNext={onSelect}>
			<slot name="intro" slot="intro" />
		</SelectUpgradeVersion>
	{/if}
</Modal>
