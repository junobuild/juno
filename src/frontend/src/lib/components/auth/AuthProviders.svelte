<script lang="ts">
	import { fromNullable, nonNullish } from '@dfinity/utils';
	import { getContext } from 'svelte';
	import IconGoogle from '$lib/components/icons/IconGoogle.svelte';
	import IconIc from '$lib/components/icons/IconIC.svelte';
	import IconPasskey from '$lib/components/icons/IconPasskey.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import { AUTH_CONFIG_CONTEXT_KEY, type AuthConfigContext } from '$lib/types/auth.context';

	const { config } = getContext<AuthConfigContext>(AUTH_CONFIG_CONTEXT_KEY);

	let openid = $derived(fromNullable($config?.openid ?? []));
	let google = $derived(openid?.providers.find(([key]) => 'Google' in key));
	let googleEnabled = $derived(nonNullish(google));
</script>

<div class="table-container">
	<table>
		<thead>
			<tr>
				<th>Provider</th>
				<th class="status">Status</th>
			</tr>
		</thead>

		<tbody>
			<tr>
				<td
					><span class="provider"><span class="icon"><IconGoogle size="20px" /></span> Google</span
					></td
				>
				<td class="status">{googleEnabled ? $i18n.core.enabled : $i18n.core.disabled}</td>
			</tr>

			<tr>
				<td><span class="provider"><span class="icon"><IconIc /></span> Internet Identity</span></td
				>
				<td class="status">{$i18n.core.enabled}</td>
			</tr>

			<tr>
				<td><span class="provider"><span class="icon"><IconPasskey /></span> Passkey</span></td>
				<td class="status">{$i18n.core.enabled}</td>
			</tr>
		</tbody>
	</table>
</div>

<style lang="scss">
	@use '../../styles/mixins/media';

	.status {
		display: none;

		@include media.min-width(medium) {
			display: table-cell;
			vertical-align: middle;
		}
	}

	tr:first-of-type td {
		padding-top: var(--padding-1_5x);
	}

	tr:last-of-type td {
		padding-bottom: var(--padding-1_5x);
	}

	.provider {
		display: flex;
		align-items: center;
		gap: var(--padding-1_5x);
	}

	.icon {
		width: 24px;
		text-align: center;
	}

	.table-container {
		margin: 0 0 var(--padding-8x);
	}
</style>
