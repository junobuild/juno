<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import { getContext } from 'svelte';
	import ButtonTableAction from '$lib/components/ui/ButtonTableAction.svelte';
	import Popover from '$lib/components/ui/Popover.svelte';
	import { banUser, unbanUser } from '$lib/services/user/user.services';
	import { authStore } from '$lib/stores/auth.store';
	import { i18n } from '$lib/stores/i18n.store';
	import { PAGINATION_CONTEXT_KEY, type PaginationContext } from '$lib/types/pagination.context';
	import type { User } from '$lib/types/user';
	import { shortenWithMiddleEllipsis } from '$lib/utils/format.utils';
	import { i18nFormat } from '$lib/utils/i18n.utils';

	interface Props {
		user: User;
		satelliteId: Principal;
	}

	let { user, satelliteId }: Props = $props();

	let { data } = $derived(user);

	let { banned } = $derived(data);

	let isBanned = $derived(banned === 'indefinite');

	let visible: boolean = $state(false);

	const open = () => (visible = true);
	const close = () => (visible = false);

	const { setItem } = getContext<PaginationContext<User>>(PAGINATION_CONTEXT_KEY);

	const handleSubmit = async ($event: SubmitEvent) => {
		$event.preventDefault();

		const fn = isBanned ? unbanUser : banUser;

		const { success } = await fn({
			identity: $authStore.identity,
			satelliteId,
			user,
			setItem
		});

		if (!success) {
			return;
		}

		visible = false;
	};
</script>

<ButtonTableAction
	icon={isBanned ? 'block' : 'check'}
	errorStyle={isBanned}
	ariaLabel={isBanned ? $i18n.users.unban_user : $i18n.users.ban_user}
	onaction={open}
/>

<Popover bind:visible center backdrop="dark">
	<form class="container" onsubmit={handleSubmit}>
		<p class="title">
			{i18nFormat(isBanned ? $i18n.users.user_banned : $i18n.users.user_active, [
				{
					placeholder: '{0}',
					value: shortenWithMiddleEllipsis(user.owner.toText())
				}
			])}
		</p>

		<p>{isBanned ? $i18n.users.unban_explanation : $i18n.users.ban_explanation}</p>

		<p>{isBanned ? $i18n.users.are_you_sure_unban : $i18n.users.are_you_sure_ban}</p>

		<div class="toolbar">
			<button type="button" onclick={close}>{$i18n.core.cancel}</button>
			<button type="submit">{$i18n.core.confirm}</button>
		</div>
	</form>
</Popover>

<style lang="scss">
	@use '../../styles/mixins/dialog';

	@include dialog.edit;

	.title {
		font-weight: var(--font-weight-bold);
	}

	p {
		white-space: initial;
		word-break: break-word;

		margin: 0 0 var(--padding-2_5x);
	}
</style>
