<script lang="ts">
	import { authSignedInStore, authStore } from '$lib/stores/auth.store';
	import { missionControlStore } from '$lib/stores/mission-control.store';
	import type { Principal } from '@dfinity/principal';
	import type { AccountIdentifier } from '@dfinity/nns';
	import { formatE8sICP } from '$lib/utils/icp.utils';
	import { isNullish, nonNullish } from '$lib/utils/utils';
	import Canister from '$lib/components/canister/Canister.svelte';
	import Warnings from '$lib/components/warning/Warnings.svelte';
	import MissionControlTopUp from '$lib/components/mission-control/MissionControlTopUp.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import type { MissionControlBalance } from '$lib/services/balance.services';
	import { getMissionControlBalance } from '$lib/services/balance.services';
	import Identifier from '$lib/components/ui/Identifier.svelte';
	import AppLang from '$lib/components/core/AppLang.svelte';
	import { versionStore } from '$lib/stores/version.store';

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

	const reloadBalance = async ({ detail: { canisterId: syncCanisterId } }) => {
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
	<Warnings />

	<div class="card-container">
		<Value>
			<svelte:fragment slot="label">{$i18n.mission_control.id}</svelte:fragment>
			<p>{$missionControlStore?.toText() ?? ''}</p>
		</Value>

		<Value>
			<svelte:fragment slot="label">{$i18n.core.version}</svelte:fragment>
			<p>v{$versionStore?.missionControl?.current ?? '...'}</p>
		</Value>

		{#if nonNullish($missionControlStore)}
			<Value>
				<svelte:fragment slot="label">{$i18n.core.status}</svelte:fragment>
				<Canister canisterId={$missionControlStore} />
			</Value>
		{/if}

		<Value>
			<svelte:fragment slot="label">{$i18n.mission_control.account_identifier}</svelte:fragment>
			<p>
				{#if nonNullish(accountIdentifier)}
					<Identifier identifier={accountIdentifier.toHex() ?? ''} />
				{/if}
			</p>
		</Value>

		<Value>
			<svelte:fragment slot="label">{$i18n.mission_control.balance}</svelte:fragment>
			<p>{formatE8sICP(balance)} ICP</p>
		</Value>

		<Value>
			<svelte:fragment slot="label">{$i18n.mission_control.credits}</svelte:fragment>
			<p>{formatE8sICP(credits)}</p>
		</Value>

		<Value>
			<svelte:fragment slot="label">{$i18n.mission_control.dev_id}</svelte:fragment>
			<p>{$authStore.identity?.getPrincipal().toText() ?? ''}</p>
		</Value>

		<AppLang />
	</div>

	<MissionControlTopUp />
{/if}
