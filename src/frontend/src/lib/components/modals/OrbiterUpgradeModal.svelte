<script lang="ts">
	import { AnonymousIdentity } from '@dfinity/agent';
	import { nonNullish } from '@dfinity/utils';
	import { upgradeOrbiter } from '@junobuild/admin';
	import { run } from 'svelte/legacy';
	import CanisterUpgradeModal from '$lib/components/modals/CanisterUpgradeModal.svelte';
	import Html from '$lib/components/ui/Html.svelte';
	import { authStore } from '$lib/stores/auth.store';
	import { i18n } from '$lib/stores/i18n.store';
	import { orbiterStore } from '$lib/stores/orbiter.store';
	import type { JunoModalDetail, JunoModalUpgradeDetail } from '$lib/types/modal';
	import { i18nFormat } from '$lib/utils/i18n.utils';
	import { container } from '$lib/utils/juno.utils';

	interface Props {
		detail: JunoModalDetail;
	}

	let { detail }: Props = $props();

	let newerReleases: string[] = $state();
	let currentVersion: string = $state();

	run(() => {
		({ newerReleases, currentVersion } = detail as JunoModalUpgradeDetail);
	});

	const upgradeOrbiterWasm = async ({ wasm_module }: { wasm_module: Uint8Array }) =>
		await upgradeOrbiter({
			orbiter: {
				orbiterId: $orbiterStore!.orbiter_id.toText(),
				identity: $authStore.identity ?? new AnonymousIdentity(),
				...container()
			},
			wasm_module
		});
</script>

{#if nonNullish($orbiterStore)}
	<CanisterUpgradeModal
		on:junoClose
		{newerReleases}
		{currentVersion}
		upgrade={upgradeOrbiterWasm}
		segment="orbiter"
	>
		{#snippet intro()}
			<h2>
				<Html
					text={i18nFormat($i18n.canisters.upgrade_title, [
						{
							placeholder: '{0}',
							value: 'orbiter'
						}
					])}
				/>
			</h2>
		{/snippet}
	</CanisterUpgradeModal>
{/if}
