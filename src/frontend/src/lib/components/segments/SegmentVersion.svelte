<script lang="ts">
	import Badge from '$lib/components/ui/Badge.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { i18n } from '$lib/stores/i18n.store';

	interface Props {
		version: string | undefined;
	}

	let { version }: Props = $props();
</script>

<div>
	<Value>
		{#snippet label()}
			{$i18n.core.version}
		{/snippet}
		<p><Badge color="primary">v{version ?? '...'}</Badge></p>
	</Value>
</div>
