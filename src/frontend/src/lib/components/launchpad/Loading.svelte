<script lang="ts">
	import LaunchpadButton from '$lib/components/launchpad/LaunchpadButton.svelte';
	import SkeletonText from '$lib/components/ui/SkeletonText.svelte';
	import { i18n } from '$lib/stores/i18n.store';
</script>

<LaunchpadButton disabled>
	<svelte:fragment slot="summary">
		<p>{$i18n.core.loading}</p>
	</svelte:fragment>

	<SkeletonText />
	<SkeletonText />
	<SkeletonText />
</LaunchpadButton>

<style lang="scss">
	@use '../../../lib/styles/mixins/fonts';

	p {
		@include fonts.bold(true);
	}
</style>