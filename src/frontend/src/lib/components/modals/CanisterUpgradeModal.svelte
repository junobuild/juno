<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import { nonNullish } from '@dfinity/utils';
	import type { BuildType, UpgradeCodeParams, UpgradeCodeProgress } from '@junobuild/admin';
	import type { Snippet } from 'svelte';
	import Html from '$lib/components/ui/Html.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import SpinnerModal from '$lib/components/ui/SpinnerModal.svelte';
	import ConfirmUpgradeVersion from '$lib/components/upgrade/ConfirmUpgradeVersion.svelte';
	import ProgressUpgradeVersion from '$lib/components/upgrade/ProgressUpgradeVersion.svelte';
	import ReviewUpgradeVersion from '$lib/components/upgrade/ReviewUpgradeVersion.svelte';
	import SelectUpgradeVersion from '$lib/components/upgrade/SelectUpgradeVersion.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import type { Wasm } from '$lib/types/upgrade';
	import { i18nFormat } from '$lib/utils/i18n.utils';

	interface Props {
		currentVersion: string;
		newerReleases: string[];
		build?: BuildType | undefined;
		segment: 'satellite' | 'mission_control' | 'orbiter';
		upgrade: ({
			wasmModule
		}: Pick<UpgradeCodeParams, 'wasmModule' | 'takeSnapshot'>) => Promise<void>;
		intro?: Snippet;
		onclose: () => void;
		canisterId: Principal;
	}

	let {
		currentVersion,
		newerReleases,
		build = undefined,
		segment,
		upgrade,
		intro,
		onclose,
		canisterId
	}: Props = $props();

	let buildExtended = $derived(nonNullish(build) && build === 'extended');

	let takeSnapshot = $state(true);

	// eslint-disable-next-line svelte/prefer-writable-derived
	let step: 'init' | 'confirm' | 'download' | 'review' | 'in_progress' | 'ready' | 'error' =
		$state('init');
	$effect(() => {
		step = buildExtended ? 'confirm' : 'init';
	});

	let progress: UpgradeCodeProgress | undefined = $state(undefined);
	const onProgress = (upgradeProgress: UpgradeCodeProgress | undefined) =>
		(progress = upgradeProgress);

	const close = () => onclose();

	let wasm: Wasm | undefined = $state(undefined);

	const onnext = ({
		steps: s,
		wasm: w
	}: {
		steps: 'review' | 'error' | 'download';
		wasm?: Wasm;
	}) => {
		wasm = w;
		step = s;
	};
</script>

<Modal on:junoClose={onclose}>
	{#if step === 'ready'}
		<div class="msg">
			<p>
				<Html
					text={i18nFormat($i18n.canisters.upgrade_done, [
						{
							placeholder: '{0}',
							value: segment.replace('_', ' ')
						},
						{
							placeholder: '{1}',
							value: `v${wasm?.version ?? ''}`
						}
					])}
				/>
			</p>
			<button onclick={close}>{$i18n.core.close}</button>
		</div>
	{:else if step === 'download'}
		<SpinnerModal>
			<p>{$i18n.canisters.download_in_progress}</p>
		</SpinnerModal>
	{:else if step === 'in_progress'}
		<ProgressUpgradeVersion {segment} {progress} {takeSnapshot} />
	{:else if step === 'review'}
		<ReviewUpgradeVersion
			{wasm}
			{segment}
			{upgrade}
			nextSteps={(next) => (step = next)}
			{onProgress}
			{onclose}
			{takeSnapshot}
			{canisterId}
		/>
	{:else if step === 'confirm'}
		<ConfirmUpgradeVersion {segment} {onclose} oncontinue={() => (step = 'init')} {intro} />
	{:else}
		<SelectUpgradeVersion
			{newerReleases}
			{segment}
			{currentVersion}
			back={buildExtended}
			bind:takeSnapshot
			{onnext}
			{onclose}
			onback={() => (step = 'confirm')}
		>
			{#snippet intro()}
				{@render intro?.()}
			{/snippet}
		</SelectUpgradeVersion>
	{/if}
</Modal>

<style lang="scss">
	@use '../../styles/mixins/overlay';

	.msg {
		@include overlay.message;
	}
</style>
