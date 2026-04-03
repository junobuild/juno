<script lang="ts">
	import { isNullish, nonNullish, notEmptyString } from '@dfinity/utils';
	import type { Nullish } from '@dfinity/zod-schemas';
	import { bytesToAAGUID } from '@junobuild/ic-client/webauthn';
	import Value from '$lib/components/ui/Value.svelte';
	import aaguids from '$lib/env/aaguids.json';
	import { type AaguidKey, type Aaguid, PasskeyAaguidsSchema } from '$lib/schemas/passkey-aaguids';
	import { i18n } from '$lib/stores/app/i18n.store';
	import { theme } from '$lib/stores/app/theme.store';
	import { Theme } from '$lib/types/theme';
	import type { User } from '$lib/types/user';

	interface Props {
		user: User;
	}

	let { user }: Props = $props();

	const mapAaguidKey = (user: User): Nullish<AaguidKey> => {
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

	const mapAaguid = (aaguid: Nullish<AaguidKey>): Nullish<Aaguid> => {
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

	let aaguidKey = $derived(mapAaguidKey(user));
	let aaguid = $derived(mapAaguid(aaguidKey));
	let authenticator = $derived(aaguid?.name);

	let iconSrc = $derived(
		notEmptyString(aaguidKey) && aaguid?.noLogo !== true
			? `/aaguids/${aaguidKey}-${$theme === Theme.DARK ? 'dark' : 'light'}.svg`
			: undefined
	);
</script>

{#if notEmptyString(aaguidKey)}
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
