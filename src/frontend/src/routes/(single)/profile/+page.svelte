<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import IdentityGuard from '$lib/components/auth/guards/IdentityGuard.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { authSignedOut } from '$lib/derived/auth.derived';
	import { credits } from '$lib/derived/console/credits.derived';
	import { loadCredits as loadCreditsServices } from '$lib/services/console/credits.services';
	import { i18n } from '$lib/stores/app/i18n.store';
	import { authStore } from '$lib/stores/auth.store';
	import { formatCredits } from '$lib/utils/icp.utils';
	import DevId from '$lib/components/app/core/DevId.svelte';

	const loadCredits = async () => {
		if ($authSignedOut) {
			return;
		}

		await loadCreditsServices({
			identity: $authStore.identity
		});
	};

	onMount(loadCredits);
</script>

<IdentityGuard>
	<div class="card-container with-title">
		<span class="title">{$i18n.profile.title}</span>

		<div class="columns-3 fit-column-1">
			<div>
				<div class="dev-id">
					<DevId />
				</div>

				<Value>
					{#snippet label()}
						{$i18n.wallet.credits}
					{/snippet}
					<p>
						{#if nonNullish($credits)}<span in:fade>{formatCredits($credits)}</span>{/if}
					</p>
				</Value>
			</div>
		</div>
	</div>
</IdentityGuard>

<style lang="scss">
	.dev-id {
		margin: 0 0 var(--padding);
	}

	p {
		min-height: 24px;
	}
</style>
