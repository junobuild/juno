<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import type { BuildType } from '@junobuild/admin';
	import CanisterUpgradeWizard, {
		type CanisterUpgradeWizardProps,
		type CanisterUpgradeWizardStep
	} from '$lib/components/canister/CanisterUpgradeWizard.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import SelectUpgradeVersion, {
		type IgnoreCanUpgradeErrorFn
	} from '$lib/components/upgrade/wizard/SelectUpgradeVersion.svelte';
	import type { Wasm } from '$lib/types/upgrade';

	interface Props {
		currentVersion: string;
		newerReleases: string[];
		build?: BuildType | undefined;
		ignoreCanUpgradeError?: IgnoreCanUpgradeErrorFn;
	}

	let {
		onclose,
		currentVersion,
		newerReleases,
		segment,
		build,
		intro: introUpgrade,
		ignoreCanUpgradeError,
		...propsRest
	}: Props &
		Omit<
			CanisterUpgradeWizardProps,
			'takeSnapshot' | 'wasm' | 'step' | 'showUpgradeExtendedWarning'
		> = $props();

	let buildExtended = $derived(nonNullish(build) && build === 'extended');

	let takeSnapshot = $state(true);

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

	let step = $state<CanisterUpgradeWizardStep>('init');
</script>

<Modal {onclose}>
	<CanisterUpgradeWizard
		{onclose}
		{segment}
		showUpgradeExtendedWarning={buildExtended}
		{takeSnapshot}
		{wasm}
		{...propsRest}
		bind:step
	>
		{#snippet intro()}
			<SelectUpgradeVersion
				back={buildExtended}
				{currentVersion}
				{ignoreCanUpgradeError}
				{newerReleases}
				onback={() => (step = 'confirm')}
				{onclose}
				{onnext}
				{segment}
				bind:takeSnapshot
			>
				{#snippet title()}
					{@render introUpgrade?.()}
				{/snippet}
			</SelectUpgradeVersion>
		{/snippet}
	</CanisterUpgradeWizard>
</Modal>
