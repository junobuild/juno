<script lang="ts">
	import ButtonTableAction from '$lib/components/ui/ButtonTableAction.svelte';
	import Popover from '$lib/components/ui/Popover.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import { busy, isBusy } from '$lib/stores/busy.store';
	import type {
		AuthenticationConfig,
		CustomDomain as CustomDomainType
	} from '$declarations/satellite/satellite.did';
	import { fromNullable, isNullish, nonNullish } from '@dfinity/utils';
	import { toasts } from '$lib/stores/toasts.store';
	import { i18nFormat } from '$lib/utils/i18n.utils';
	import type { Satellite } from '$declarations/mission_control/mission_control.did';
	import { deleteCustomDomain as deleteCustomDomainService } from '$lib/services/hosting.services';
	import { emit } from '$lib/utils/events.utils';
	import { authStore } from '$lib/stores/auth.store';
	import type { JunoModalCustomDomainDetail } from '$lib/types/modal';
	import IconWarning from '$lib/components/icons/IconWarning.svelte';
	import { setAuthConfig } from '$lib/api/satellites.api';

	export let satellite: Satellite;
	export let customDomain: [string, CustomDomainType] | undefined;
	export let displayState: string | null | undefined;
	export let config: AuthenticationConfig | undefined;

	let visible = false;

	const openDelete = async () => {
		if (isNullish(customDomain)) {
			toasts.error({
				text: $i18n.errors.hosting_no_custom_domain
			});
			return;
		}

		visible = true;
	};

	let deleteMainDomain = false;
	$: deleteMainDomain =
		nonNullish(customDomain?.[0]) &&
		customDomain?.[0] ===
			fromNullable(fromNullable(config?.internet_identity ?? [])?.derivation_origin ?? []);

	let advancedOptions = false;
	let skipDeleteDomain = false;

	const updateConfig = async () => {
		if (isNullish(config)) {
			return;
		}

		const updateConfig: AuthenticationConfig = deleteMainDomain
			? {
					...config,
					...(nonNullish(fromNullable(config.internet_identity)) && {
						internet_identity: [
							{
								...fromNullable(config.internet_identity),
								derivation_origin: []
							}
						]
					})
				}
			: config;

		await setAuthConfig({
			satelliteId: satellite.satellite_id,
			config: updateConfig,
			identity: $authStore.identity
		});
	};

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
				customDomain: customDomain[1],
				deleteCustomDomain: !skipDeleteDomain
			});

			await updateConfig();

			emit({ message: 'junoSyncCustomDomains' });

			visible = false;
		} catch (err: unknown) {
			toasts.error({
				text: $i18n.errors.hosting_delete_custom_domain,
				detail: err
			});

			advancedOptions = true;
		}

		busy.stop();
	};

	const openAddCustomDomain = async (
		params: Pick<JunoModalCustomDomainDetail, 'editDomainName'>
	) => {
		emit({
			message: 'junoModal',
			detail: {
				type: 'add_custom_domain',
				detail: { satellite, config, ...params }
			}
		});
	};
</script>

<div class="tools">
	<ButtonTableAction on:click={openDelete} ariaLabel={$i18n.hosting.delete} icon="delete" />

	{#if displayState !== undefined && displayState?.toLowerCase() !== 'available'}
		<ButtonTableAction
			on:click={async () => await openAddCustomDomain({ editDomainName: customDomain?.[0] })}
			ariaLabel={$i18n.hosting.edit}
			icon="edit"
		/>
	{/if}
</div>

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

		{#if deleteMainDomain}
			<p><span class="warning"><IconWarning /></span> {$i18n.hosting.delete_auth_domain_warning}</p>
		{/if}

		<p>{$i18n.hosting.delete_are_you_sure}</p>

		<div class="toolbar">
			<button type="button" on:click|stopPropagation={() => (visible = false)} disabled={$isBusy}>
				{$i18n.core.no}
			</button>

			<button type="button" on:click|stopPropagation={deleteCustomDomain} disabled={$isBusy}>
				{$i18n.core.yes}
			</button>
		</div>

		{#if advancedOptions}
			<hr />
			<div class="checkbox">
				<input type="checkbox" on:change={() => (skipDeleteDomain = !skipDeleteDomain)} />
				<span>{$i18n.hosting.skip_delete_domain}</span>
			</div>
		{/if}
	</div>
</Popover>

<style lang="scss">
	.content {
		display: flex;
		flex-direction: column;

		padding: var(--padding-2x);

		h3,
		p {
			white-space: initial;
			word-break: break-word;
		}
	}

	.tools {
		display: flex;
		gap: var(--padding);
	}

	.toolbar {
		display: flex;
		gap: var(--padding-2x);
	}

	p {
		padding: 0 0 var(--padding-2x);
	}

	.checkbox {
		padding: var(--padding-2x) 0 0;

		span {
			white-space: pre-wrap;
		}
	}

	.warning {
		color: var(--color-warning);
	}
</style>
