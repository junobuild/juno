<script lang="ts">
	import UserEmail from '$lib/components/auth/UserEmail.svelte';
	import UserProfile from '$lib/components/auth/UserProfile.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import type { User } from '$lib/types/user';
	import { isGoogleUser } from '$lib/utils/user.utils';

	interface Props {
		user: User;
	}

	let { user }: Props = $props();

	let google = $derived(isGoogleUser(user));
</script>

{#if google}
	<div>
		<Value>
			{#snippet label()}
				{$i18n.users.user}
			{/snippet}

			<div class="user">
				<UserProfile {user} />
				<UserEmail {user} />
			</div>
		</Value>
	</div>
{/if}

<style lang="scss">
	.user {
		display: flex;
		flex-direction: column;
		gap: var(--padding-0_5x);

		margin: 0 0 var(--padding);

		:global(p) {
			max-width: 200px;
		}
	}
</style>
