<script lang="ts">
	import { fromNullable, fromNullishNullable, isNullish, nonNullish } from '@dfinity/utils';
	import { fade } from 'svelte/transition';
	import type { SatelliteDid, MissionControlDid } from '$declarations';
	import AuthConfigAdvancedOptions from '$lib/components/auth/AuthConfigAdvancedOptions.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import Warning from '$lib/components/ui/Warning.svelte';
	import { sortedSatelliteCustomDomains } from '$lib/derived/satellite-custom-domains.derived';
	import { isBusy } from '$lib/stores/busy.store';
	import { i18n } from '$lib/stores/i18n.store';
	import { satelliteUrl as satelliteUrlUtils } from '$lib/utils/satellite.utils';
	import { i18nFormat } from '$lib/utils/i18n.utils';
    import Input from "$lib/components/ui/Input.svelte";

	interface Props {
		config: SatelliteDid.AuthenticationConfig | undefined;
		onsubmit: ($event: SubmitEvent) => Promise<void>;
        clientId: string
	}

	let { onsubmit, config, clientId = $bindable('') }: Props = $props();

	let openid = $state(fromNullable(config?.openid ?? []));
	let google = $state(openid?.providers.find(([key]) => 'Google' in key));
    let providerData = $state(google?.[1]);
	let googleEnabled = $state(nonNullish(google));

    let clientIdInput = $state(providerData?.client_id ?? "");

    $effect(() => {
       clientId = clientIdInput;
    });
</script>

<h2>Google</h2>

<p>
	{i18nFormat(
		googleEnabled
			? $i18n.authentication.edit_provider
			: $i18n.authentication.edit_to_enable_provider,
		[
			{
				placeholder: '{0}',
				value: 'Google'
			}
		]
	)}
</p>

<form class="content" {onsubmit}>
	<div class="container">
		<div>
            <Value>
                {#snippet label()}
                    {$i18n.authentication.client_id}
                {/snippet}

                <Input
                        name="client_id"
                        inputType="text"
                        placeholder={$i18n.authentication.client_id_placeholder}
                        required={true}
                        bind:value={clientIdInput}
                />
            </Value>
		</div>
	</div>

	<button disabled={$isBusy} type="submit">
		{$i18n.core.submit}
	</button>
</form>
