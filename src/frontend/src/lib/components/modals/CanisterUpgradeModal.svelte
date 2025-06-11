<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import type { BuildType } from '@junobuild/admin';
	import CanisterUpgradeWizard, {
		type CanisterUpgradeWizardProps,
		type CanisterUpgradeWizardStep
	} from '$lib/components/canister/CanisterUpgradeWizard.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import SelectUpgradeVersion from '$lib/components/upgrade/wizard/SelectUpgradeVersion.svelte';
	import type { Wasm } from '$lib/types/upgrade';

	interface Props {
		currentVersion: string;
		newerReleases: string[];
		build?: BuildType | undefined;
	}

	let {
		onclose,
		currentVersion,
		newerReleases,
		segment,
		build,
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
		{takeSnapshot}
		{wasm}
		showUpgradeExtendedWarning={buildExtended}
		{...propsRest}
		bind:step
	>
		{#snippet intro()}
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
		{/snippet}
	</CanisterUpgradeWizard>
</Modal>
