<script lang="ts">
	import { Signer } from '@dfinity/oisy-wallet-signer/signer';
    import {type AccountsApproval, type AccountsPromptPayload, ICRC27_ACCOUNTS} from "@dfinity/oisy-wallet-signer";
    import {isNullish, nonNullish} from "@dfinity/utils";
    import { fade } from 'svelte/transition';
    import type {MissionControlId} from "$lib/types/mission-control";

	interface Props {
		signer: Signer | undefined;
        missionControlId: MissionControlId;
	}

	let { signer, missionControlId }: Props = $props();

    let approve = $state<AccountsApproval | undefined | null>(undefined);

    const resetPrompt = () => {
        approve = null;
    };

    $effect(() => {
        if (isNullish(signer)) {
            resetPrompt();
            return;
        }

        signer.register({
            method: ICRC27_ACCOUNTS,
            prompt: ({ approve: approveAccounts }: AccountsPromptPayload) => {
                approve = approveAccounts;
            }
        });
    });

    $effect(() => {
        if (isNullish(approve)) {
            return;
        }

        approve([
            {
                owner: missionControlId.toText()
            }
        ]);

        // Just to animate the UI. Strictly related to this demo.
        setTimeout(() => resetPrompt(), 1000);
    });
</script>

{#if nonNullish(approve)}
    <p transition:fade>Notifying account...</p>
{/if}