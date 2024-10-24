<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import { fade } from 'svelte/transition';
	import AppLangSelect from '$lib/components/core/AppLangSelect.svelte';
	import IdentityGuard from '$lib/components/guards/IdentityGuard.svelte';
	import Identifier from '$lib/components/ui/Identifier.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { authRemainingTimeStore, authStore } from '$lib/stores/auth.store';
	import { i18n } from '$lib/stores/i18n.store';
	import type { Languages } from '$lib/types/languages';
	import { secondsToDuration } from '$lib/utils/date.utils';

	let lang: Languages = $state();

	let remainingTimeMilliseconds: number | undefined = $derived($authRemainingTimeStore);
</script>

<IdentityGuard>
	<div class="card-container with-title">
		<span class="title">{$i18n.preferences.title}</span>

		<div class="content">
			<Value>
				{#snippet label()}
					{$i18n.preferences.dev_id}
				{/snippet}
				<Identifier identifier={$authStore.identity?.getPrincipal().toText() ?? ''} />
			</Value>

			<div class="session">
				<Value>
					{#snippet label()}
						{$i18n.preferences.session_expires_in}
					{/snippet}
					<p>
						{#if nonNullish(remainingTimeMilliseconds)}
							<output class="mr-1.5" in:fade>
								{remainingTimeMilliseconds <= 0
									? '0'
									: secondsToDuration(BigInt(remainingTimeMilliseconds) / 1000n)}
							</output>
						{/if}
					</p>
				</Value>
			</div>

			<AppLangSelect bind:selected={lang} />
		</div>
	</div>
</IdentityGuard>

<style lang="scss">
	.session {
		padding: var(--padding) 0 0;
	}

	p {
		min-height: 24px;
	}
</style>
