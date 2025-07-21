<script lang="ts">
	import { AnonymousIdentity } from '@dfinity/agent';
	import { nonNullish } from '@dfinity/utils';
	import { type UpgradeCodeParams, upgradeMissionControl } from '@junobuild/admin';
	import CanisterUpgradeModal from '$lib/components/modals/CanisterUpgradeModal.svelte';
	import Html from '$lib/components/ui/Html.svelte';
	import { missionControlIdDerived } from '$lib/derived/mission-control.derived';
	import { reloadMissionControlVersion } from '$lib/services/version/version.mission-control.services';
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

	const upgradeMissionControlWasm = async (
		params: Pick<UpgradeCodeParams, 'wasmModule' | 'onProgress'>
	) =>
		await upgradeMissionControl({
			missionControl: {
				// TODO: resolve no-non-null-assertion
				// We know for sure that the mission control is defined at this point.
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				missionControlId: $missionControlIdDerived!.toText(),
				identity: $authStore.identity ?? new AnonymousIdentity(),
				...container()
			},
			...params
		});

	const reloadVersion = async () => {
		await reloadMissionControlVersion({
			// TODO: resolve no-non-null-assertion
			// We know for sure that the mission control is defined at this point.
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			missionControlId: $missionControlIdDerived!
		});
	};
</script>

{#if nonNullish($missionControlIdDerived)}
	<CanisterUpgradeModal
		{onclose}
		{newerReleases}
		{currentVersion}
		upgrade={upgradeMissionControlWasm}
		{reloadVersion}
		segment="mission_control"
		canisterId={$missionControlIdDerived}
	>
		{#snippet intro()}
			<h2>
				<Html
					text={i18nFormat($i18n.canisters.upgrade_title, [
						{
							placeholder: '{0}',
							value: 'mission control center'
						}
					])}
				/>
			</h2>
		{/snippet}
	</CanisterUpgradeModal>
{/if}
