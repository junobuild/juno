<script lang="ts">
	import IdentityGuard from '$lib/components/guards/IdentityGuard.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import { authStore } from '$lib/stores/auth.store';
	import Value from '$lib/components/ui/Value.svelte';
	import AppLang from '$lib/components/core/AppLang.svelte';
	import type { Languages } from '$lib/types/languages';

	let lang: Languages;
</script>

<IdentityGuard>
	<div class="card-container">
		<Value>
			<svelte:fragment slot="label">{$i18n.settings.dev_id}</svelte:fragment>
			<p>{$authStore.identity?.getPrincipal().toText() ?? ''}</p>
		</Value>

		<AppLang bind:selected={lang} />
	</div>
</IdentityGuard>
