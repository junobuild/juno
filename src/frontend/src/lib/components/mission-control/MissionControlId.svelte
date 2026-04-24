<script lang="ts">
	import Identifier from '$lib/components/ui/Identifier.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { i18n } from '$lib/stores/app/i18n.store';
	import type { MissionControlId } from '$lib/types/mission-control';

	interface Props {
		missionControlId: MissionControlId;
	}

	let { missionControlId }: Props = $props();
</script>

<Value>
	{#snippet label()}
		{$i18n.mission_control.id}
	{/snippet}

	<Identifier identifier={missionControlId.toText()} shorten={false} small={false} />
</Value>
