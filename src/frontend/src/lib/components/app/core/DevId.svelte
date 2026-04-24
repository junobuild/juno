<script lang="ts">
	import Identifier from '$lib/components/ui/Identifier.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { i18n } from '$lib/stores/app/i18n.store';
	import { devId } from '$lib/derived/dev.derived';
</script>

<Value>
	{#snippet label()}
		{$i18n.profile.dev_id}
	{/snippet}

	<Identifier identifier={$devId?.toText() ?? ''} />
</Value>
