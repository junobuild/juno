<script lang="ts">
	import ButtonDelete from '$lib/components/ui/ButtonDelete.svelte';
	import Popover from '$lib/components/ui/Popover.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import { busy } from '$lib/stores/busy.store';
	import type { CustomDomain as CustomDomainType } from '$declarations/satellite/satellite.did';
	import { isNullish } from '$lib/utils/utils';
	import { toasts } from '$lib/stores/toasts.store';
	import { i18nFormat } from '$lib/utils/i18n.utils';
	import type { Satellite } from '$declarations/mission_control/mission_control.did';
	import { deleteCustomDomain as deleteCustomDomainService } from '$lib/services/hosting.services';
	import { createEventDispatcher } from 'svelte';
	import { emit } from '$lib/utils/events.utils';

	export let satellite: Satellite;
	export let customDomain: [string, CustomDomainType] | undefined;

	let visible = false;

	const openDelete = () => {
		if (isNullish(customDomain)) {
			toasts.error({
				text: $i18n.errors.hosting_no_custom_domain
			});
			return;
		}

		visible = true;
	};

	const dispatch = createEventDispatcher();

	const deleteCustomDomain = async () => {
		if (isNullish(customDomain)) {
			toasts.error({
				text: $i18n.errors.hosting_no_custom_domain
			});
			return;
		}

		busy.start();

		try {
			await deleteCustomDomainService({
				satelliteId: satellite.satellite_id,
				domainName: customDomain[0],
				customDomain: customDomain[1]
			});

			emit({ message: 'junoSyncCustomDomains' });

			visible = false;
		} catch (err: unknown) {
			toasts.error({
				text: $i18n.errors.hosting_delete_custom_domain,
				detail: err
			});
		}

		busy.stop();
	};
</script>

<ButtonDelete on:click={openDelete} />

<Popover bind:visible center={true}>
	<div class="content">
		<h3>
			{@html i18nFormat($i18n.hosting.delete_custom_domain, [
				{
					placeholder: '{0}',
					value: customDomain?.[0] ?? ''
				}
			])}
		</h3>

		<p>{$i18n.hosting.before_continuing}</p>

		<p>{$i18n.hosting.delete_are_you_sure}</p>

		<button type="button" on:click|stopPropagation={() => (visible = false)} disabled={$busy}>
			{$i18n.core.no}
		</button>

		<button type="button" on:click|stopPropagation={deleteCustomDomain} disabled={$busy}>
			{$i18n.core.yes}
		</button>
	</div>
</Popover>

<style lang="scss">
	.content {
		padding: var(--padding-2x);

		h3,
		p {
			white-space: initial;
			word-break: break-word;
		}
	}
</style>
