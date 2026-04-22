<script lang="ts">
	const isApple =
		typeof window !== 'undefined' &&
		(/iPad|iPhone/.test(window.navigator.userAgent) || window.navigator.userAgent.includes('Mac'));

	const searchKey = isApple ? '⌘' : 'ctrl';
</script>

<span class="keys"><span class="key">{searchKey}</span><span class="key">K</span></span>

<style lang="scss">
	.keys {
		display: inline-flex;
		justify-content: center;
		align-items: center;
		gap: var(--padding-0_5x);
	}

	.key {
		display: inline-flex;
		justify-content: center;
		align-items: center;

		height: var(--padding-3x);
		min-width: var(--padding-3x);

		border: 1px solid var(--text-color);
	}
</style>
