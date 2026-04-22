<script lang="ts">
	import { notEmptyString } from '@dfinity/utils';
	import { fade } from 'svelte/transition';
	import IconEdit from '$lib/components/icons/IconEdit.svelte';
	import Popover from '$lib/components/ui/Popover.svelte';
	import SkeletonText from '$lib/components/ui/SkeletonText.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { EMAIL_PLACEHOLDER } from '$lib/constants/monitoring.constants';
	import { isBusy } from '$lib/derived/app/busy.derived';
	import { authIdentity } from '$lib/derived/auth.derived';
	import { missionControlId } from '$lib/derived/console/account.mission-control.derived';
	import {
		missionControlEmail,
		missionControlMetadata,
		missionControlUserDataLoaded
	} from '$lib/derived/mission-control/mission-control-user.derived';
	import { setMetadataEmail } from '$lib/services/mission-control/mission-control.services';
	import { busy } from '$lib/stores/app/busy.store';
	import { i18n } from '$lib/stores/app/i18n.store';

	let email = $state('');
	let visible: boolean = $state(false);

	let validConfirm = $derived(notEmptyString(email));

	const open = ($event: MouseEvent | TouchEvent) => {
		$event.stopPropagation();

		email = $missionControlEmail ?? '';
		visible = true;
	};

	const handleSubmit = async ($event: SubmitEvent) => {
		$event.preventDefault();

		busy.start();

		const { success } = await setMetadataEmail({
			identity: $authIdentity,
			missionControlId: $missionControlId,
			metadata: $missionControlMetadata ?? [],
			email
		});

		busy.stop();

		if (!success) {
			return;
		}

		visible = false;
		email = '';
	};
</script>

<Value>
	{#snippet label()}
		{$i18n.core.email_address}
	{/snippet}

	{#if $missionControlUserDataLoaded}
		<p class="email" in:fade>
			<span>{$missionControlEmail ?? $i18n.core.none}</span>

			<button
				class="square"
				aria-label={$i18n.mission_control.edit_email}
				onclick={open}
				title={$i18n.mission_control.edit_email}
			>
				<IconEdit />
			</button>
		</p>
	{:else}
		<p><SkeletonText /></p>
	{/if}
</Value>

<Popover backdrop="dark" center bind:visible>
	<form class="container" onsubmit={handleSubmit}>
		<label for="email">{$i18n.core.email_address}:</label>

		<input
			id="email"
			autocomplete="off"
			data-1p-ignore
			disabled={$isBusy}
			placeholder={EMAIL_PLACEHOLDER}
			type="text"
			bind:value={email}
		/>

		<button class="submit" disabled={$isBusy || !validConfirm} type="submit">
			{$i18n.core.apply}
		</button>
	</form>
</Popover>

<style lang="scss">
	@use '../../styles/mixins/dialog';
	@use '../../styles/mixins/text';

	@include dialog.edit;

	.email {
		max-width: 60%;

		span {
			@include text.truncate;
		}
	}
</style>
