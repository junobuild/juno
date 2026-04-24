<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import { Principal } from '@icp-sdk/core/principal';
	import InputCanisterId from '$lib/components/app/core/InputCanisterId.svelte';
	import IconLink from '$lib/components/icons/IconLink.svelte';
	import CheckboxInline from '$lib/components/ui/CheckboxInline.svelte';
	import Html from '$lib/components/ui/Html.svelte';
	import Popover from '$lib/components/ui/Popover.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { isBusy } from '$lib/derived/app/busy.derived';
	import { authIdentity } from '$lib/derived/auth.derived';
	import { missionControlId } from '$lib/derived/console/account.mission-control.derived';
	import { attachSegment } from '$lib/services/attach-detach/attach.services';
	import { busy } from '$lib/stores/app/busy.store';
	import { i18n } from '$lib/stores/app/i18n.store';
	import { toasts } from '$lib/stores/app/toasts.store';
	import { i18nCapitalize, i18nFormat } from '$lib/utils/i18n.utils';

	let visible = $state(false);

	let segment = $state<'satellite' | 'orbiter' | 'ufo'>('satellite');

	let validConfirm = $state(false);
	let canisterId = $state('');

	const handleSubmit = async ($event: SubmitEvent) => {
		$event.preventDefault();

		if (!validConfirm) {
			// Submit is disabled if not valid
			toasts.error({
				text: $i18n.errors.canister_id_missing
			});
			return;
		}

		busy.start();

		const { result } = await attachSegment({
			segmentId: Principal.fromText(canisterId),
			segment,
			missionControlId:
				nonNullish($missionControlId) && attachToMissionControl ? $missionControlId : null,
			identity: $authIdentity
		});

		busy.stop();

		if (result === 'error') {
			return;
		}

		visible = false;

		toasts.success({
			text: i18nCapitalize(
				i18nFormat($i18n.canisters.attach_success, [
					{
						placeholder: '{0}',
						value: segment
					}
				])
			)
		});
	};

	let attachToMissionControl = $state(true);
</script>

<button class="primary" aria-label={$i18n.core.attach} onclick={() => (visible = true)}
	><IconLink /></button
>

<Popover backdrop="dark" center bind:visible>
	<form class="container" onsubmit={handleSubmit}>
		<h3>{$i18n.launchpad.attach_title}</h3>

		<p>{$i18n.launchpad.attach_description}</p>

		<div>
			<Value>
				{#snippet label()}
					{$i18n.cli.module}
				{/snippet}

				<select bind:value={segment}>
					<option value="satellite">{$i18n.satellites.satellite}</option>
					<option value="orbiter">{$i18n.analytics.orbiter} ({$i18n.analytics.title})</option>
					<option value="ufo">{$i18n.ufo.title}</option>
				</select>
			</Value>
		</div>

		<InputCanisterId disabled={$isBusy} bind:canisterId bind:valid={validConfirm}>
			{#snippet label()}
				{$i18n.launchpad.attach_id}
			{/snippet}
		</InputCanisterId>

		{#if nonNullish($missionControlId)}
			<CheckboxInline bind:checked={attachToMissionControl}>
				<span>{$i18n.launchpad.attach_to_mission_control}</span>
			</CheckboxInline>
		{/if}

		<button class="submit" disabled={$isBusy || !validConfirm} type="submit">
			{$i18n.core.submit}
		</button>
	</form>
</Popover>

<style lang="scss">
	@use '../../../styles/mixins/dialog';

	@include dialog.edit;

	label {
		margin: var(--padding-1_5x) 0 0;
	}

	p,
	span {
		font-size: var(--font-size-small);
	}
</style>
