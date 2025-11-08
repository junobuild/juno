<script lang="ts">
	import { nonNullish, notEmptyString } from '@dfinity/utils';
	import Avatar from '$lib/components/ui/Avatar.svelte';
	import type { User } from '$lib/types/user';
	import { isGoogleUser } from '$lib/utils/user.utils';

	interface Props {
		user: User;
	}

	let { user }: Props = $props();

	let providerData = $derived(isGoogleUser(user) ? user.data.providerData : undefined);
	let name = $derived(providerData?.openid.name);
	let picture = $derived(providerData?.openid.picture);
</script>

{#if nonNullish(name)}
	<p>
		{#if notEmptyString(picture)}
			<Avatar alt="" size="20px" src={picture} />
		{/if}

		<span>{name}</span>
	</p>
{/if}

<style lang="scss">
	@use '../../styles/mixins/text';

	p {
		display: inline-flex;
		align-items: center;
		gap: var(--padding);

		vertical-align: middle;

		margin: 0;

		max-width: 100%;
	}

	span {
		@include text.truncate;
	}
</style>
