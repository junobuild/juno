<script lang="ts">
	import { i18n } from '$lib/stores/i18n.store';
	import Value from '$lib/components/ui/Value.svelte';
	import Input from '$lib/components/ui/Input.svelte';
    import {i18nFormat} from "$lib/utils/i18n.utils";
    import {formatE8sICP} from "$lib/utils/icp.utils";

	export let balance: bigint | undefined;

	let destination = '';
    let amount: number | undefined;

	const onSubmit = async () => {};
</script>

<h2>{$i18n.wallet.send}</h2>

<p>
    {@html i18nFormat($i18n.wallet.send_information, [
        {
            placeholder: '{0}',
            value: formatE8sICP(balance ?? 0n)
        }
    ])}
</p>

<form class="content" on:submit|preventDefault={onSubmit}>
    <div>
        <Value>
            <svelte:fragment slot="label">{$i18n.wallet.destination}</svelte:fragment>
            <Input inputType="text" name="destination" placeholder={$i18n.wallet.destination_placeholder} bind:value={destination} />
        </Value>
    </div>

    <div>
        <Value>
            <svelte:fragment slot="label">{$i18n.wallet.tx_amount}</svelte:fragment>
            <Input
                    name="amount"
                    inputType="icp"
                    required
                    bind:value={amount}
                    placeholder={$i18n.wallet.tx_amount}
            />
        </Value>
    </div>
</form>

<style lang="scss">
    form {
      margin: var(--padding-4x) 0;
    }

    div {
      margin-bottom: var(--padding);
    }
</style>