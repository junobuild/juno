<script lang="ts">
	import ButtonCard from '$lib/components/ui/ButtonCard.svelte';
	import SkeletonText from '$lib/components/ui/SkeletonText.svelte';
	import { i18n } from '$lib/stores/i18n.store';
</script>

<ButtonCard disabled>
	<svelte:fragment slot="summary">
		<h2>{$i18n.core.loading}</h2>
	</svelte:fragment>

	<SkeletonText />
	<SkeletonText />
	<SkeletonText />
</ButtonCard>
