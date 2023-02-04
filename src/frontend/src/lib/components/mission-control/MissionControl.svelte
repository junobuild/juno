<script lang="ts">
	import { authSignedInStore, authStore } from '$lib/stores/auth.store';
	import { missionControlStore } from '$lib/stores/mission-control.store';
	import type { Principal } from '@dfinity/principal';
	import { getAccountIdentifier, getBalance } from '$lib/api/ledger.api';
	import type { AccountIdentifier } from '@dfinity/nns';
	import { satelliteStore } from '$lib/stores/satellite.store';
	import { getCredits } from '$lib/api/console.api';
	import { formatE8sICP } from '$lib/utils/icp.utils';
	import { isNullish, nonNullish } from '$lib/utils/utils';
	import Canister from '$lib/components/canister/Canister.svelte';
	import Warnings from '$lib/components/warning/Warnings.svelte';
	import MissionControlTopUp from '$lib/components/mission-control/MissionControlTopUp.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { i18n } from '$lib/stores/i18n.store';

	let accountIdentifier: AccountIdentifier | undefined = undefined;
	let balance = 0n;
	let credits = 0n;

	const loadBalance = async () => {
		if (isNullish(accountIdentifier)) {
			balance = 0n;
			return;
		}

		balance = (await getBalance(accountIdentifier)).toE8s();
	};

	const loadCredits = async () => {
		if (isNullish($missionControlStore)) {
			credits = 0n;
			return;
		}

		credits = await getCredits();
	};

	const initAccountIdentifier = (missionControlId: Principal | undefined | null) => {
		if (isNullish(missionControlId)) {
			accountIdentifier = undefined;
			return;
		}

		accountIdentifier = getAccountIdentifier(missionControlId);
	};

	$: initAccountIdentifier($missionControlStore);
	$: $missionControlStore, $satelliteStore, loadCredits();
	$: accountIdentifier, $satelliteStore, loadBalance();
</script>

{#if $authSignedInStore}
	<Warnings />

	<div class="card-container">
		<Value>
			<svelte:fragment slot="label">{$i18n.mission_control.id}</svelte:fragment>
			<p>{$missionControlStore?.toText() ?? ''}</p>
		</Value>

		{#if nonNullish($missionControlStore)}
			<Value>
				<svelte:fragment slot="label">{$i18n.core.status}</svelte:fragment>
				<Canister canisterId={$missionControlStore} />
			</Value>
		{/if}

		<Value>
			<svelte:fragment slot="label">{$i18n.mission_control.account_identifier}</svelte:fragment>
			<p>{accountIdentifier?.toHex() ?? ''}</p>
		</Value>

		<Value>
			<svelte:fragment slot="label">{$i18n.mission_control.balance}</svelte:fragment>
			<p>{formatE8sICP(balance)} ICP</p>
		</Value>

		<Value>
			<svelte:fragment slot="label">{$i18n.mission_control.credits}</svelte:fragment>
			<p>{credits}</p>
		</Value>

		<Value>
			<svelte:fragment slot="label">{$i18n.mission_control.dev_id}</svelte:fragment>
			<p>{$authStore.identity?.getPrincipal().toText() ?? ''}</p>
		</Value>
	</div>

	<MissionControlTopUp />
{/if}
