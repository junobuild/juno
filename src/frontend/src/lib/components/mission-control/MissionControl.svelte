<script lang="ts">
	import { authSignedInStore } from '$lib/stores/auth.store';
	import { missionControlStore } from '$lib/stores/mission-control.store';
	import type { Principal } from '@dfinity/principal';
	import { formatE8sICP } from '$lib/utils/icp.utils';
	import { isNullish, nonNullish } from '$lib/utils/utils';
	import CanisterOverview from '$lib/components/canister/CanisterOverview.svelte';
	import MissionControlTopUp from '$lib/components/mission-control/MissionControlTopUp.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import { getMissionControlBalance } from '$lib/services/balance.services';
	import Identifier from '$lib/components/ui/Identifier.svelte';
	import { versionStore } from '$lib/stores/version.store';
	import type { AccountIdentifier } from '@junobuild/ledger';
	import QRCodeContainer from '$lib/components/ui/QRCodeContainer.svelte';
	import type { MissionControlBalance } from '$lib/types/balance.types';

	let missionControlBalance: MissionControlBalance | undefined = undefined;

	const loadBalance = async (missionControlId: Principal | undefined | null) => {
		const { result } = await getMissionControlBalance(missionControlId);
		missionControlBalance = result;
	};

	$: $missionControlStore, loadBalance($missionControlStore);

	let accountIdentifier: AccountIdentifier | undefined;
	let balance = 0n;
	let credits = 0n;

	$: ({ balance, credits, accountIdentifier } = missionControlBalance ?? {
		balance: 0n,
		credits: 0n,
		accountIdentifier: undefined
	});

	const reloadBalance = async ({
		detail: { canisterId: syncCanisterId }
	}: CustomEvent<{ canisterId: Principal }>) => {
		if (
			isNullish($missionControlStore) ||
			syncCanisterId.toText() !== $missionControlStore.toText()
		) {
			return;
		}

		await loadBalance($missionControlStore);
	};
</script>

<svelte:window on:junoRestartCycles={reloadBalance} />

{#if $authSignedInStore}
	<div class="card-container columns-3">
		<div>
			<Value>
				<svelte:fragment slot="label">{$i18n.mission_control.id}</svelte:fragment>
				<Identifier
					identifier={$missionControlStore?.toText() ?? ''}
					shorten={false}
					small={false}
				/>
			</Value>

			<Value>
				<svelte:fragment slot="label">{$i18n.core.version}</svelte:fragment>
				<p>v{$versionStore?.missionControl?.current ?? '...'}</p>
			</Value>

			{#if nonNullish($missionControlStore)}
				<CanisterOverview canisterId={$missionControlStore} />
			{/if}
		</div>

		<div>
			<Value>
				<svelte:fragment slot="label">{$i18n.mission_control.balance}</svelte:fragment>
				<p>{formatE8sICP(balance)} ICP</p>
			</Value>

			<Value>
				<svelte:fragment slot="label">{$i18n.mission_control.credits}</svelte:fragment>
				<p>{formatE8sICP(credits)}</p>
			</Value>
		</div>

		<div>
			<Value>
				<svelte:fragment slot="label">{$i18n.mission_control.account_identifier}</svelte:fragment>
				<p>
					{#if nonNullish(accountIdentifier)}
						<Identifier identifier={accountIdentifier.toHex() ?? ''} />

						<QRCodeContainer
							value={accountIdentifier.toHex()}
							ariaLabel={$i18n.mission_control.account_identifier}
						/>
					{/if}
				</p>
			</Value>
		</div>
	</div>

	<MissionControlTopUp />
{/if}
