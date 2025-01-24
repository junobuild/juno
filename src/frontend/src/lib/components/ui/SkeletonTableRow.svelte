<script lang="ts">
	import SkeletonText from '$lib/components/ui/SkeletonText.svelte';

	interface Props {
		colspan: number;
	}

	let { colspan }: Props = $props();
</script>

<tr
	><td {colspan}>
		<div class="skeleton">
			&ZeroWidthSpace;<SkeletonText />
		</div>
	</td></tr
>

<style lang="scss">
	.skeleton {
		display: flex;
		max-width: 200px;
		--skeleton-text-padding: var(--padding-0_25x) 0;
	}
</style>
