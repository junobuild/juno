<script lang="ts">
	import { fromNullable, isNullish, nonNullish } from '@dfinity/utils';
	import { getContext } from 'svelte';
	import type { MissionControlDid } from '$declarations';
	import Value from '$lib/components/ui/Value.svelte';
	import {
		A_MONTH_NS,
		A_WEEK_NS,
		AN_HOUR_NS,
		EIGHT_HOURS_NS,
		FOUR_HOURS_NS,
		HALF_DAY_NS,
		ONE_DAY_NS,
		TWO_HOURS_NS,
		TWO_WEEKS_NS
	} from '$lib/constants/auth.constants';
	import { i18n } from '$lib/stores/i18n.store';
	import { AUTH_CONFIG_CONTEXT_KEY, type AuthConfigContext } from '$lib/types/auth.context';
	import type { JunoModalEditAuthConfigDetailType } from '$lib/types/modal';
	import { secondsToDuration } from '$lib/utils/date.utils';
	import { i18nFormat } from '$lib/utils/i18n.utils';
	import { satelliteName } from '$lib/utils/satellite.utils';

	interface Props {
		satellite: MissionControlDid.Satellite;
		openModal: (params: JunoModalEditAuthConfigDetailType) => Promise<void>;
	}

	let { satellite, openModal }: Props = $props();

	const { config, supportConfig } = getContext<AuthConfigContext>(AUTH_CONFIG_CONTEXT_KEY);

	let openid = $derived(fromNullable($config?.openid ?? []));
	let google = $derived(openid?.providers.find(([key]) => 'Google' in key));

	let providerData = $derived(google?.[1]);

	let clientId = $derived(providerData?.client_id);

	let delegation = $derived(fromNullable(providerData?.delegation ?? []));
	let maxTimeToLive = $derived(fromNullable(delegation?.max_time_to_live ?? []) ?? ONE_DAY_NS);
	let targets = $derived(
		// delegation.targets===[] (exactly equals because delegation is undefined by default)
		nonNullish(delegation) && nonNullish(delegation.targets) && delegation.targets.length === 0
			? null
			: // delegation.targets===[[]]
				(fromNullable(delegation?.targets ?? []) ?? []).length === 0
				? undefined
				: (fromNullable(delegation?.targets ?? []) ?? []).map((p) => p.toText())
	);

	let targetsSelf = $derived(
		targets?.length === 1 && targets[0] === satellite.satellite_id.toText()
	);

	const openEditModal = async () =>
		await openModal({
			google: null
		});
</script>

<div class="card-container with-title">
	<span class="title">Google</span>

	<div class="columns-3 fit-column-1">
		<div>
			{#if $supportConfig}
				<div>
					<Value>
						{#snippet label()}
							{$i18n.authentication.client_id}
						{/snippet}

						{#if isNullish(clientId)}
							<p>{$i18n.authentication.not_configured}</p>
						{:else}
							<p class="client-id">{clientId}</p>
						{/if}
					</Value>
				</div>
			{/if}
		</div>

		<div>
			{#if $supportConfig && nonNullish(clientId)}
				<div>
					<Value>
						{#snippet label()}
							{$i18n.authentication.session_duration}
						{/snippet}

						<p>
							{#if maxTimeToLive === BigInt(AN_HOUR_NS)}
								{$i18n.core.an_hour}
							{:else if maxTimeToLive === BigInt(TWO_HOURS_NS)}
								{$i18n.core.two_hours}
							{:else if maxTimeToLive === BigInt(FOUR_HOURS_NS)}
								{$i18n.core.four_hours}
							{:else if maxTimeToLive === BigInt(EIGHT_HOURS_NS)}
								{$i18n.core.eight_hours}
							{:else if maxTimeToLive === BigInt(HALF_DAY_NS)}
								{$i18n.core.half_day}
							{:else if maxTimeToLive === BigInt(ONE_DAY_NS)}
								{$i18n.core.a_day}
							{:else if maxTimeToLive === BigInt(A_WEEK_NS)}
								{$i18n.core.a_week}
							{:else if maxTimeToLive === BigInt(TWO_WEEKS_NS)}
								{$i18n.core.two_weeks}
							{:else if maxTimeToLive === BigInt(A_MONTH_NS)}
								{$i18n.core.a_month}
							{:else}
								{secondsToDuration(maxTimeToLive ?? 0n)}
							{/if}
						</p>
					</Value>
				</div>

				<div>
					<Value>
						{#snippet label()}
							{$i18n.authentication.allowed_targets}
						{/snippet}

						{#if targets === null}
							<p>{$i18n.authentication.no_restrictions}</p>
						{:else if targets === undefined || targetsSelf}
							<p>{$i18n.authentication.target_your_satellite} {satelliteName(satellite)}</p>
						{:else}
							<p>
								{i18nFormat($i18n.authentication.target_modules, [
									{
										placeholder: '{0}',
										value: `${targets.length}`
									}
								])}
							</p>
						{/if}
					</Value>
				</div>
			{/if}
		</div>
	</div>
</div>

<button disabled={!$supportConfig} onclick={openEditModal}>{$i18n.core.configure}</button>

<style lang="scss">
	@use '../../styles/mixins/text';
	@use '../../styles/mixins/media';

	p {
		&:not(.client-id) {
			@include text.truncate;
		}

		&.client-id {
			@include text.clamp(2);
		}
	}

	button {
		margin: 0 0 var(--padding-8x);
	}
</style>
