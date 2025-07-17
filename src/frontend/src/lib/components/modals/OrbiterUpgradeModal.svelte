<script lang="ts">
	import { AnonymousIdentity } from '@dfinity/agent';
	import { nonNullish } from '@dfinity/utils';
	import { type UpgradeCodeParams, upgradeOrbiter } from '@junobuild/admin';
	import CanisterUpgradeModal from '$lib/components/modals/CanisterUpgradeModal.svelte';
	import Html from '$lib/components/ui/Html.svelte';
	import { orbiterStore } from '$lib/derived/orbiter.derived';
	import { reloadOrbiterVersion } from '$lib/services/version/version.orbiter.services';
	import { authStore } from '$lib/stores/auth.store';
	import { i18n } from '$lib/stores/i18n.store';
	import type { JunoModalDetail, JunoModalUpgradeDetail } from '$lib/types/modal';
	import { i18nFormat } from '$lib/utils/i18n.utils';
	import { container } from '$lib/utils/juno.utils';

	interface Props {
		detail: JunoModalDetail;
		onclose: () => void;
	}

	let { detail, onclose }: Props = $props();

	let { newerReleases, currentVersion } = $derived(detail as JunoModalUpgradeDetail);

	const upgradeOrbiterWasm = async (params: Pick<UpgradeCodeParams, 'wasmModule' | 'onProgress'>) =>
		await upgradeOrbiter({
			orbiter: {
				// TODO: resolve no-non-null-assertion
				// We know for sure that the orbiter is defined at this point.
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				orbiterId: $orbiterStore!.orbiter_id.toText(),
				identity: $authStore.identity ?? new AnonymousIdentity(),
				...container()
			},
			...params
		});

	const reloadVersion = async () => {
		await reloadOrbiterVersion({
			orbiterId: $orbiterStore?.orbiter_id,
			identity: $authStore.identity ?? new AnonymousIdentity(),
			skipReload: false
		});
	};
</script>

{#if nonNullish($orbiterStore)}
	<CanisterUpgradeModal
		{onclose}
		{newerReleases}
		{currentVersion}
		upgrade={upgradeOrbiterWasm}
		{reloadVersion}
		segment="orbiter"
		canisterId={$orbiterStore.orbiter_id}
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
