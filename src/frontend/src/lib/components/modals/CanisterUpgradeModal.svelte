<script lang="ts">
	import {createEventDispatcher, onMount} from 'svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import Modal from '$lib/components/ui/Modal.svelte';
	import SpinnerModal from '$lib/components/ui/SpinnerModal.svelte';
	import type { GitHubRelease, NewerReleasesAssetKey, PromptReleases } from '@junobuild/admin';
	import { mapPromptReleases } from '@junobuild/admin';
	import {last} from "$lib/utils/utils";

	export let newerReleases: GitHubRelease[];
	export let assetKey: NewerReleasesAssetKey;

	let steps: 'init' | 'in_progress' | 'ready' | 'error' = 'init';

	const dispatch = createEventDispatcher();
	const close = () => dispatch('junoClose');

	let promptReleases: PromptReleases[] = [];
	let selectedVersion: string | undefined = undefined;

	onMount(() => {
		promptReleases = mapPromptReleases({ githubReleases: newerReleases, assetKey });
		selectedVersion = last(promptReleases)?.title;
	});
</script>

<Modal on:junoClose>
	{#if steps === 'ready'}
		<div class="msg">
			<slot name="outro" />
			<button on:click={close}>{$i18n.core.close}</button>
		</div>
	{:else if steps === 'in_progress'}
		<SpinnerModal>
			<p>{$i18n.canisters.upgrade_in_progress}</p>
		</SpinnerModal>
	{:else}
		<slot name="intro" />

		<div class="container">
			{#each promptReleases as prompt, i}
				<label>
					<input type="radio" bind:group={selectedVersion} name="selectedVersion" value={prompt.title} />
					<span>{prompt.title}</span>
				</label>
			{/each}
		</div>
	{/if}
</Modal>

<style lang="scss">
	.container {
		display: flex;
		flex-direction: column;
	}
</style>