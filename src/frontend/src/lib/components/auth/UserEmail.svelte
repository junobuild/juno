<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import type { User } from '$lib/types/user';
	import { isGoogleUser } from '$lib/utils/user.utils';

	interface Props {
		user: User;
	}

	let { user }: Props = $props();

	let providerData = $derived(isGoogleUser(user) ? user.data.providerData : undefined);
	let email = $derived(providerData?.openid.email);
</script>

{#if nonNullish(email)}
	<p>
		{email}
	</p>
{/if}

<style lang="scss">
	@use '../../styles/mixins/text';

	p {
		margin: 0;

		@include text.truncate;
	}
</style>
