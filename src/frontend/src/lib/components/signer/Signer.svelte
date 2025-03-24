<script lang="ts">
	import {Signer} from "@dfinity/oisy-wallet-signer/signer";
    import {authNotSignedIn} from "$lib/derived/auth.derived";
    import {isNullish} from "@dfinity/utils";
    import { authStore } from '$lib/stores/auth.store';
    import SignerPermissions from "$lib/components/signer/SignerPermissions.svelte";
    import SignerAccounts from "$lib/components/signer/SignerAccounts.svelte";
    import type {MissionControlId} from "$lib/types/mission-control";

    interface Props {
        missionControlId: MissionControlId;
    }

    let { missionControlId }: Props = $props();

    let signer = $state<Signer | undefined>(undefined);

    $effect(() => {
        if ($authNotSignedIn) {
            signer?.disconnect();
            return;
        }

        if (isNullish($authStore.identity)) {
            signer?.disconnect();
            return;
        }

        signer = Signer.init({
            owner: $authStore.identity,
            host: 'http://localhost:5987'
        });

        return () => {
            signer?.disconnect();
        };
    });
</script>

<SignerPermissions {signer} />

<SignerAccounts {signer} {missionControlId} />
