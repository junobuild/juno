<script module lang="ts">
	import type { BuildType, UpgradeCodeParams } from '@junobuild/admin';
	import type { Snippet } from 'svelte';
	import type { Principal } from '@dfinity/principal';

	export interface CanisterUpgradeWizardProps {
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
</script>

<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import type { UpgradeCodeProgress } from '@junobuild/admin';
	import Html from '$lib/components/ui/Html.svelte';
	import SpinnerModal from '$lib/components/ui/SpinnerModal.svelte';
	import ConfirmUpgradeVersion from '$lib/components/upgrade/wizard/ConfirmUpgradeVersion.svelte';
	import ProgressUpgradeVersion from '$lib/components/upgrade/wizard/ProgressUpgradeVersion.svelte';
	import ReviewUpgradeVersion from '$lib/components/upgrade/wizard/ReviewUpgradeVersion.svelte';
	import SelectUpgradeVersion from '$lib/components/upgrade/wizard/SelectUpgradeVersion.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import type { Wasm } from '$lib/types/upgrade';
	import { i18nFormat } from '$lib/utils/i18n.utils';

	let {
		currentVersion,
		newerReleases,
		build = undefined,
		segment,
		upgrade,
		intro,
		onclose,
		canisterId
	}: CanisterUpgradeWizardProps = $props();

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
		<button onclick={onclose}>{$i18n.core.close}</button>
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

<style lang="scss">
	@use '../../styles/mixins/overlay';

	.msg {
		@include overlay.message;
	}
</style>
