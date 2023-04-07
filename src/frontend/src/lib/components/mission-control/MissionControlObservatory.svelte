<script lang="ts">
	import { i18n } from '$lib/stores/i18n.store';
	import { isNullish, nonNullish } from '$lib/utils/utils';
	import Value from '$lib/components/ui/Value.svelte';
	import { toasts } from '$lib/stores/toasts.store';
	import { busy, isBusy } from '$lib/stores/busy.store';
	import Input from '$lib/components/ui/Input.svelte';
	import {getCronTab, setCronTab} from '$lib/api/observatory.api';
	import type { Principal } from '@dfinity/principal';
	import type {CronTab} from "$declarations/observatory/observatory.did";
	import {fromNullable} from "$lib/utils/did.utils";
	import {onMount} from "svelte";
	import { fade } from 'svelte/transition';
	import SpinnerParagraph from "$lib/components/ui/SpinnerParagraph.svelte";

	export let missionControlId: Principal;

	let threshold: number | undefined;
	let email: string | undefined = undefined;

	const onSubmit = async () => {
		if (isNullish(email)) {
			toasts.error({
				text: $i18n.errors.satellite_name_missing
			});
			return;
		}

		if (isNullish(threshold)) {
			toasts.error({
				text: $i18n.errors.satellite_name_missing
			});
			return;
		}

		busy.start();

		try {
			await setCronTab({
				missionControlId,
				cronTab: undefined,
				cron_jobs: {
					metadata: [['email', email]],
					statuses: {
						enabled: true,
						cycles_threshold: BigInt(threshold)
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

	const loadCrontab = async () => {
		try {
			cronTab = fromNullable(await getCronTab({missionControlId}));

			loading = false;
		} catch (err: unknown) {
			toasts.error({
				text: $i18n.errors.observatory_get_unexpected_error,
				detail: err
			});
		}
	}

	onMount(async () => await loadCrontab());
</script>

<div class="card-container">
	{#if loading}
		<SpinnerParagraph>{$i18n.observatory.loading}</SpinnerParagraph>
	{:else}
		<form on:submit|preventDefault={onSubmit} transition:fade>
			<Value>
				<svelte:fragment slot="label">{$i18n.satellites.name}</svelte:fragment>
				<input
						bind:value={email}
						type="email"
						name="email"
						placeholder={$i18n.satellites.enter_name}
						required
				/>
			</Value>

			<Value>
				<svelte:fragment slot="label">{$i18n.satellites.name}</svelte:fragment>
				<Input
						inputType="number"
						placeholder={$i18n.collections.max_size_placeholder}
						name="threshold"
						required
						bind:value={threshold}
						on:blur={() => (threshold = nonNullish(threshold) ? Math.trunc(threshold) : undefined)}
				/>
			</Value>

			<button type="submit" disabled={$isBusy}>{$i18n.satellites.create}</button>
		</form>
	{/if}
</div>
