<script lang="ts">
	import IconEqualNot from '$lib/components/icons/IconEqualNot.svelte';

	interface Props {
		small?: boolean;
	}

	let { small }: Props = $props();
</script>

<div class="arrow">
	<IconEqualNot size={small ? '32px' : '48px'} />
</div>

<style lang="scss">
	@use '../../styles/mixins/media';

	.arrow {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 0 0 var(--padding-3x);
	}
</style>
