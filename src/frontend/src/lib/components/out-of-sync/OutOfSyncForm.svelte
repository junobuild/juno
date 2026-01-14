<script lang="ts">
	import { i18n } from '$lib/stores/app/i18n.store';
	import OutOfSyncSegments from '$lib/components/out-of-sync/OutOfSyncSegments.svelte';
    import IconEqualNot from "$lib/components/icons/IconEqualNot.svelte";
	import GridEqualNot from "$lib/components/ui/GridEqualNot.svelte";

	interface Props {
		onsubmit: ($event: SubmitEvent) => Promise<void>;
	}

	let { onsubmit }: Props = $props();
</script>

<h2>{$i18n.out_of_sync.title}</h2>

<p>{$i18n.out_of_sync.description}</p>

<form {onsubmit}>
	<div class="columns">
		<OutOfSyncSegments>
			{#snippet label()}
				{$i18n.out_of_sync.console}
			{/snippet}
		</OutOfSyncSegments>

		<GridEqualNot small />

		<OutOfSyncSegments>
			{#snippet label()}
				{$i18n.mission_control.title}
			{/snippet}
		</OutOfSyncSegments>
	</div>
</form>

<style lang="scss">
	@use '../../styles/mixins/grid';

	.columns {
		@include grid.two-columns-with-arrow;
	}

	.identifier {
		margin: 0 0 var(--padding);
	}
</style>
