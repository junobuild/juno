<script lang="ts">
	import Article from '$lib/components/ui/Article.svelte';
	import SkeletonText from '$lib/components/ui/SkeletonText.svelte';
	import { i18n } from '$lib/stores/i18n.store';
</script>

<Article disabled>
	<svelte:fragment slot="summary">
		<h2>{$i18n.core.loading}</h2>
	</svelte:fragment>

	<SkeletonText />
	<SkeletonText />
	<SkeletonText />
	<SkeletonText />
</Article>
