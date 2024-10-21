<script lang="ts">
	import { AnonymousIdentity } from '@dfinity/agent';
	import { nonNullish } from '@dfinity/utils';
	import { upgradeOrbiter } from '@junobuild/admin';
	import CanisterUpgradeModal from '$lib/components/modals/CanisterUpgradeModal.svelte';
	import { authStore } from '$lib/stores/auth.store';
	import { i18n } from '$lib/stores/i18n.store';
	import { orbiterStore } from '$lib/stores/orbiter.store';
	import type { JunoModalDetail, JunoModalUpgradeDetail } from '$lib/types/modal';
	import { i18nFormat } from '$lib/utils/i18n.utils';
	import { container } from '$lib/utils/juno.utils';
	import Html from '$lib/components/ui/Html.svelte';

	export let detail: JunoModalDetail;

	let newerReleases: string[];
	let currentVersion: string;

	$: ({ newerReleases, currentVersion } = detail as JunoModalUpgradeDetail);

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
		<h2 slot="intro">
			<Html
				text={i18nFormat($i18n.canisters.upgrade_title, [
					{
						placeholder: '{0}',
						value: 'orbiter'
					}
				])}
			/>
		</h2>
	</CanisterUpgradeModal>
{/if}
