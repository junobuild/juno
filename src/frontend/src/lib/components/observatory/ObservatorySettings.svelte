<script lang="ts">
	import { i18n } from '$lib/stores/i18n.store';
	import { isNullish, nonNullish } from '@dfinity/utils';
	import Value from '$lib/components/ui/Value.svelte';
	import { toasts } from '$lib/stores/toasts.store';
	import { busy, isBusy } from '$lib/stores/busy.store';
	import Input from '$lib/components/ui/Input.svelte';
	import { getCronTab, setCronTab } from '$lib/api/observatory.api';
	import type { Principal } from '@dfinity/principal';
	import type { CronTab } from '$declarations/observatory/observatory.did';
	import { fromNullable, toNullable } from '@dfinity/utils';
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import SpinnerParagraph from '$lib/components/ui/SpinnerParagraph.svelte';
	import { metadataEmail } from '$lib/utils/metadata.utils';
	import { CYCLES_WARNING, ONE_TRILLION } from '$lib/constants/constants';
	import { authStore } from '$lib/stores/auth.store';

	export let missionControlId: Principal;

	// Source: https://stackoverflow.com/a/46181/5404186
	const validEmail = (email: string): boolean => {
		return (
			email.match(
				// eslint-disable-next-line no-useless-escape
				/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
			) !== null
		);
	};

	const onSubmit = async () => {
		if (enabled && (email === '' || !validEmail(email ?? ''))) {
			toasts.error({
				text: $i18n.errors.invalid_email
			});
			return;
		}

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
						satellites: [],
						orbiters: []
					}
				},
				identity: $authStore.identity
			});

			setInitValues();
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

	let initialEnabled = false;
	let initialThreshold: number | undefined;
	let initialEmail: string | undefined = undefined;

	const loadCrontab = async () => {
		try {
			cronTab = fromNullable(await getCronTab($authStore.identity));

			enabled = cronTab?.cron_jobs.statuses.enabled ?? false;
			email = metadataEmail(cronTab?.cron_jobs.metadata ?? []);
			threshold = nonNullish(fromNullable(cronTab?.cron_jobs.statuses.cycles_threshold ?? []))
				? Number(cronTab?.cron_jobs.statuses.cycles_threshold) / ONE_TRILLION
				: undefined;

			setInitValues();

			loading = false;
		} catch (err: unknown) {
			toasts.error({
				text: $i18n.errors.observatory_get_unexpected_error,
				detail: err
			});
		}
	};

	const setInitValues = () => {
		initialEnabled = enabled;
		initialEmail = email;
		initialThreshold = threshold;
	};

	onMount(async () => await loadCrontab());

	let invalidEmail = false;
	$: invalidEmail = nonNullish(email) && email !== '' && !validEmail(email);

	let invalidThreshold = false;
	$: invalidThreshold = nonNullish(threshold) && threshold < Number(CYCLES_WARNING) / ONE_TRILLION;
</script>

{#if loading}
	<SpinnerParagraph>{$i18n.core.loading}</SpinnerParagraph>
{:else}
	<form on:submit|preventDefault={onSubmit} in:fade>
		<div class="card-container with-title">
			<span class="title">{$i18n.observatory.parameters}</span>

			<div class="content">
				<div>
					<Value>
						<svelte:fragment slot="label">{$i18n.observatory.monitoring}</svelte:fragment>

						<div class="radio">
							<label>
								<input type="radio" bind:group={enabled} name="field" value={false} />
								<span>{$i18n.observatory.disabled}</span>
							</label>

							<label>
								<input type="radio" bind:group={enabled} name="field" value={true} />
								<span>{$i18n.observatory.enabled}</span>
							</label>
						</div>
					</Value>
				</div>

				<div class="email">
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
			</div>
		</div>

		<div>
			<button type="submit" disabled={$isBusy || invalidEmail || invalidThreshold}
				>{$i18n.core.save}</button
			>
		</div>
	</form>
{/if}

<style lang="scss">
	form {
		display: flex;
		flex-direction: column;
		gap: var(--padding);
	}

	button {
		margin: 0;
	}

	.radio {
		display: flex;
		flex-direction: column;

		padding: 0 0 var(--padding-2x);
	}

	.email {
		padding: 0 0 var(--padding);
	}
</style>
