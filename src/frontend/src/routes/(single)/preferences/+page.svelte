<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import { fade } from 'svelte/transition';
	import AppLangSelect from '$lib/components/app/core/AppLangSelect.svelte';
	import IdentityGuard from '$lib/components/auth/guards/IdentityGuard.svelte';
	import Theme from '$lib/components/ui/Theme.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { i18n } from '$lib/stores/app/i18n.store';
	import { authRemainingTimeStore } from '$lib/stores/auth.store';
	import type { Languages } from '$lib/types/languages';
	import { secondsToDuration } from '$lib/utils/date.utils';

	let lang = $state<Languages>('en');

	let remainingTimeMilliseconds: number | undefined = $derived($authRemainingTimeStore);
</script>

<IdentityGuard>
	<div class="card-container with-title">
		<span class="title">{$i18n.preferences.title}</span>

		<div class="columns-3 fit-column-1">
			<div>
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

				<AppLangSelect bind:selected={lang} />

				<div class="theme">
					<Value>
						{#snippet label()}
							{$i18n.core.theme}
						{/snippet}

						<div>
							<Theme inline />
						</div>
					</Value>
				</div>
			</div>
		</div>
	</div>
</IdentityGuard>

<style lang="scss">
	p {
		min-height: 24px;
	}

	.theme {
		margin: var(--padding) 0 0;

		div {
			padding: var(--padding) 0 0;
		}
	}
</style>
