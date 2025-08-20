<script lang="ts">
	import { AnonymousIdentity } from '@dfinity/agent';
	import { nonNullish } from '@dfinity/utils';
	import { type UpgradeCodeParams, upgradeOrbiter } from '@junobuild/admin';
	import { compare } from 'semver';
	import CanisterUpgradeModal from '$lib/components/modals/CanisterUpgradeModal.svelte';
	import Html from '$lib/components/ui/Html.svelte';
	import type { IgnoreCanUpgradeErrorFn } from '$lib/components/upgrade/wizard/SelectUpgradeVersion.svelte';
	import { ORBITER_v0_0_8, ORBITER_v0_2_0 } from '$lib/constants/version.constants';
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
			orbiterId: $orbiterStore?.orbiter_id
		});
	};

	// For some reason, we skipped releasing Orbiter v0.1.0 and went straight from v0.0.8 to v0.2.1.
	// As a result, checkUpgradeVersion will prevent the upgrade because there is more than one minor version
	// in between. That is why we are manually allowing this upgrade.
	const ignoreCanUpgradeError: IgnoreCanUpgradeErrorFn = ({ currentVersion, selectedVersion }) =>
		compare(currentVersion, ORBITER_v0_0_8) === 0 && compare(selectedVersion, ORBITER_v0_2_0) === 0;
</script>

{#if nonNullish($orbiterStore)}
	<CanisterUpgradeModal
		canisterId={$orbiterStore.orbiter_id}
		{currentVersion}
		{ignoreCanUpgradeError}
		{newerReleases}
		{onclose}
		{reloadVersion}
		segment="orbiter"
		upgrade={upgradeOrbiterWasm}
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
