<script lang="ts">
	import { i18n } from '$lib/stores/i18n.store';
	import { isNullish, nonNullish } from '$lib/utils/utils';
	import Value from '$lib/components/ui/Value.svelte';
	import { toasts } from '$lib/stores/toasts.store';
	import { busy, isBusy } from '$lib/stores/busy.store';
	import Input from '$lib/components/ui/Input.svelte';
	import { getCronTab, setCronTab } from '$lib/api/observatory.api';
	import type { Principal } from '@dfinity/principal';
	import type { CronTab } from '$declarations/observatory/observatory.did';
	import { fromNullable, toNullable } from '$lib/utils/did.utils';
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import SpinnerParagraph from '$lib/components/ui/SpinnerParagraph.svelte';
	import { metadataEmail } from '$lib/utils/metadata.utils';
	import { CYCLES_WARNING, ONE_TRILLION } from '$lib/constants/constants';

	export let missionControlId: Principal;

	// Source: https://stackoverflow.com/a/46181/5404186
	const validEmail = (email: string): boolean => {
		return (
			email.match(
				/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
			) !== null
		);
	};

	const onSubmit = async () => {
		busy.start();

		try {
			cronTab = await setCronTab({
				missionControlId,
				cronTab,
				cron_jobs: {
					metadata:
						nonNullish(email) && email !== '' && validEmail(email) ? [['email', email]] : [],
					statuses: {
						enabled,
						cycles_threshold: toNullable(
							isNullish(threshold) || threshold === 0 ? null : BigInt(threshold * ONE_TRILLION)
						),
						mission_control_cycles_threshold: [],
						satellites: []
					}
				}
			});
		} catch (err: unknown) {
			toasts.error({
				text: $i18n.errors.observatory_set_unexpected_error,
				detail: err
			});
		}

		busy.stop();
	};

	let loading = true;
	let cronTab: CronTab | undefined;

	let enabled = false;
	let threshold: number | undefined;
	let email: string | undefined = undefined;

	const loadCrontab = async () => {
		try {
			cronTab = fromNullable(await getCronTab());

			enabled = cronTab?.cron_jobs.statuses.enabled ?? false;
			email = metadataEmail(cronTab?.cron_jobs.metadata ?? []);
			threshold = nonNullish(fromNullable(cronTab?.cron_jobs.statuses.cycles_threshold ?? []))
				? Number(cronTab?.cron_jobs.statuses.cycles_threshold) / ONE_TRILLION
				: undefined;

			loading = false;
		} catch (err: unknown) {
			toasts.error({
				text: $i18n.errors.observatory_get_unexpected_error,
				detail: err
			});
		}
	};

	onMount(async () => await loadCrontab());

	let invalidEmail = false;
	$: invalidEmail = nonNullish(email) && email !== '' && !validEmail(email);

	let invalidThreshold = false;
	$: invalidThreshold = nonNullish(threshold) && threshold < Number(CYCLES_WARNING) / ONE_TRILLION;

	let dirty = false;
	$: dirty = cronTab?.cron_jobs.statuses.enabled !== enabled;
</script>

<div class="card-container">
	{#if loading}
		<SpinnerParagraph>{$i18n.observatory.loading}</SpinnerParagraph>
	{:else}
		<form on:submit|preventDefault={onSubmit} in:fade>
			<div>
				<Value>
					<svelte:fragment slot="label">{$i18n.observatory.monitoring}</svelte:fragment>
					<div class="checkbox">
						<input type="checkbox" bind:checked={enabled} />
						<span>{dirty ? (enabled ? $i18n.observatory.submit_enable : $i18n.observatory.submit_disable) :
								enabled ? $i18n.observatory.enabled : $i18n.observatory.disabled}</span>
					</div>
				</Value>
			</div>

			<div>
				<Value>
					<svelte:fragment slot="label">{$i18n.observatory.email_notifications}</svelte:fragment>
					<input
						bind:value={email}
						type="email"
						name="email"
						placeholder={$i18n.observatory.email_notifications_placeholder}
					/>
				</Value>
			</div>

			<div>
				<Value>
					<svelte:fragment slot="label">{$i18n.observatory.cycles_threshold}</svelte:fragment>
					<div class="input">
						<Input
							inputType="number"
							placeholder={$i18n.observatory.cycles_threshold_placeholder}
							name="threshold"
							required={false}
							bind:value={threshold}
						/>
					</div>
				</Value>
			</div>

			<button type="submit" disabled={$isBusy || invalidEmail || invalidThreshold}
				>{$i18n.core.submit}</button
			>
		</form>
	{/if}
</div>

<style lang="scss">
	form {
		display: flex;
		flex-direction: column;
		gap: var(--padding);
	}

	.checkbox {
		margin: var(--padding-0_25x) 0 0;
	}

	button {
		margin: var(--padding-2x) 0 0;
	}
</style>
