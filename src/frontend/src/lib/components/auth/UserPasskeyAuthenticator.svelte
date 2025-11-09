<script lang="ts">
	import { isNullish, nonNullish, notEmptyString } from '@dfinity/utils';
	import { bytesToAAGUID } from '@junobuild/ic-client/webauthn';
	import Value from '$lib/components/ui/Value.svelte';
	import aaguids from '$lib/env/aaguids.json';
	import { type Aaguid, type AaguidName, PasskeyAaguidsSchema } from '$lib/schemas/passkey-aaguids';
	import { i18n } from '$lib/stores/i18n.store';
	import { theme } from '$lib/stores/theme.store';
	import { Theme } from '$lib/types/theme';
	import type { User } from '$lib/types/user';
	import type { Option } from '$lib/types/utils';

	interface Props {
		user: User;
	}

	let { user }: Props = $props();

	const mapAaguid = (user: User): Option<Aaguid> => {
		const {
			data: { providerData }
		} = user;

		if (isNullish(providerData) || !('webauthn' in providerData)) {
			return null;
		}

		const {
			webauthn: { aaguid }
		} = providerData;

		if (isNullish(aaguid)) {
			return undefined;
		}

		const result = bytesToAAGUID({ bytes: aaguid });

		if (!('aaguid' in result)) {
			return null;
		}

		const { aaguid: aaguidText } = result;

		return aaguidText;
	};

	const mapAaguidText = (aaguid: Option<Aaguid>): Option<AaguidName> => {
		if (isNullish(aaguid)) {
			return null;
		}

		const passkeys = PasskeyAaguidsSchema.safeParse(aaguids);

		if (!passkeys.success) {
			return undefined;
		}

		const { data } = passkeys;

		return data[aaguid];
	};

	let aaguid = $derived(mapAaguid(user));
	let authenticator = $derived(mapAaguidText(aaguid));

	let iconSrc = $derived(
		notEmptyString(aaguid)
			? `/aaguids/${aaguid}-${$theme === Theme.DARK ? 'dark' : 'light'}.svg`
			: undefined
	);
</script>

{#if notEmptyString(aaguid)}
	<div>
		<Value>
			{#snippet label()}
				{$i18n.users.authenticator}
			{/snippet}
			<p class="provider">
				{#if nonNullish(iconSrc)}
					<img alt={$i18n.users.authenticator_logo} src={iconSrc} />
				{/if}
				<span>{authenticator}</span>
			</p>
		</Value>
	</div>
{/if}

<style lang="scss">
	.provider {
		display: inline-flex;
		align-items: center;
		gap: var(--padding);
	}

	img {
		width: 20px;
	}
</style>
