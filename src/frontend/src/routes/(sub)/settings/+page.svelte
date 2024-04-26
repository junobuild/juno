<script lang="ts">
	import IdentityGuard from '$lib/components/guards/IdentityGuard.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import { authRemainingTimeStore, authStore } from '$lib/stores/auth.store';
	import Value from '$lib/components/ui/Value.svelte';
	import AppLangSelect from '$lib/components/core/AppLangSelect.svelte';
	import type { Languages } from '$lib/types/languages';
	import Identifier from '$lib/components/ui/Identifier.svelte';
	import { nonNullish } from '@dfinity/utils';
	import { secondsToDuration } from '$lib/utils/date.utils';
	import { fade } from 'svelte/transition';

	let lang: Languages;

	let remainingTimeMilliseconds: number | undefined;
	$: remainingTimeMilliseconds = $authRemainingTimeStore;
</script>

<IdentityGuard>
	<div class="card-container">
		<Value>
			<svelte:fragment slot="label">{$i18n.settings.dev_id}</svelte:fragment>
			<Identifier identifier={$authStore.identity?.getPrincipal().toText() ?? ''} />
		</Value>

		<div class="session">
			<Value>
				<svelte:fragment slot="label">{$i18n.settings.session_expires_in}</svelte:fragment>
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
</IdentityGuard>

<style lang="scss">
	.session {
		padding: var(--padding) 0 0;
	}

	p {
		min-height: 24px;
	}
</style>
