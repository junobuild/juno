<script lang="ts">
	import { i18n } from '$lib/stores/app/i18n.store';
	import type { Satellite } from '$lib/types/satellite';
	import type { SatelliteDid } from '$declarations';
    import {fromNullable, isNullish, nonNullish} from '@dfinity/utils';
	import { AUTOMATION_DEFAULT_MAX_SESSION_TIME_TO_LIVE } from '$lib/constants/automation.constants';
    import Value from "$lib/components/ui/Value.svelte";
    import {
        A_MONTH_NS,
        A_WEEK_NS,
        AN_HOUR_NS,
        EIGHT_HOURS_NS,
        FOUR_HOURS_NS,
        HALF_DAY_NS,
        ONE_DAY_NS,
        TWO_HOURS_NS, TWO_WEEKS_NS
    } from "$lib/constants/auth.constants";
    import {secondsToDuration} from "$lib/utils/date.utils";

	interface Props {
		satellite: Satellite;
		config: SatelliteDid.OpenIdAutomationProviderConfig;
	}

	let { satellite, config }: Props = $props();

	let controller = $derived(fromNullable(config?.controller));
	let scope = $derived(
		nonNullish(controller?.scope) && 'Submit' in controller?.scope ? 'submit' : 'write'
	);
	let maxTimeToLive = $derived(
		fromNullable(controller?.max_time_to_live ?? []) ?? AUTOMATION_DEFAULT_MAX_SESSION_TIME_TO_LIVE
	);
</script>

<div class="card-container with-title">
	<span class="title">{$i18n.automation.keys}</span>

	<div class="columns-3 fit-column-1">
		<div>
            <div>
                <Value>
                    {#snippet label()}
                        {$i18n.controllers.scope}
                    {/snippet}

                    <p>{scope === "submit" ? $i18n.controllers.submit : $i18n.controllers.write}</p>
                </Value>
            </div>
		</div>

        <div>
            <div>
                <Value>
                    {#snippet label()}
                        {$i18n.automation.access_duration}
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
        </div>
	</div>
</div>
