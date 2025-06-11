<script module lang="ts">
	import type { Principal } from '@dfinity/principal';
	import type { UpgradeCodeParams } from '@junobuild/admin';
	import type { Snippet } from 'svelte';
	import type { Wasm } from '$lib/types/upgrade';

	export interface CanisterUpgradeWizardProps {
		showUpgradeExtendedWarning?: boolean;
		takeSnapshot: boolean;
		wasm: Wasm | undefined;
		segment: 'satellite' | 'mission_control' | 'orbiter';
		upgrade: ({
			wasmModule
		}: Pick<UpgradeCodeParams, 'wasmModule' | 'takeSnapshot'>) => Promise<void>;
		intro: Snippet;
		onclose: () => void;
		canisterId: Principal;
		step: CanisterUpgradeWizardStep;
	}

	export type CanisterUpgradeWizardStep =
		| 'init'
		| 'confirm'
		| 'download'
		| 'review'
		| 'in_progress'
		| 'ready'
		| 'error';
</script>

<script lang="ts">
	import type { UpgradeCodeProgress } from '@junobuild/admin';
	import { onMount } from 'svelte';
	import Html from '$lib/components/ui/Html.svelte';
	import SpinnerModal from '$lib/components/ui/SpinnerModal.svelte';
	import ConfirmUpgradeVersion from '$lib/components/upgrade/wizard/ConfirmUpgradeVersion.svelte';
	import ProgressUpgradeVersion from '$lib/components/upgrade/wizard/ProgressUpgradeVersion.svelte';
	import ReviewUpgradeVersion from '$lib/components/upgrade/wizard/ReviewUpgradeVersion.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import { i18nFormat } from '$lib/utils/i18n.utils';

	let {
		showUpgradeExtendedWarning = false,
		segment,
		upgrade,
		intro,
		onclose,
		canisterId,
		takeSnapshot,
		wasm,
		step = $bindable('init')
	}: CanisterUpgradeWizardProps = $props();

	onMount(() => {
		step = showUpgradeExtendedWarning ? 'confirm' : 'init';
	});

	let progress: UpgradeCodeProgress | undefined = $state(undefined);
	const onProgress = (upgradeProgress: UpgradeCodeProgress | undefined) =>
		(progress = upgradeProgress);
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
						value: `v${wasm?.developerVersion ?? wasm?.version ?? ''}`
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
	{@render intro()}
{/if}

<style lang="scss">
	@use '../../styles/mixins/overlay';

	.msg {
		@include overlay.message;
	}
</style>
