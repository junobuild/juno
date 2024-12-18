<script lang="ts">
	import IconWarning from '$lib/components/icons/IconWarning.svelte';

	interface Props {
		title: string | undefined;
	}

	let { title }: Props = $props();
</script>

<span class="warning" {title}><IconWarning /></span>

<style lang="scss">
	.warning {
		color: var(--color-warning);
	}

	.warning {
		display: inline-block;

		&:not(:hover) {
			animation: shake 0.5s linear infinite;
		}
	}

	/* -global- */
	@keyframes -global-shake {
		0% {
			transform: rotate(0deg);
		}
		25% {
			transform: rotate(5deg);
		}
		50% {
			transform: rotate(0);
		}
		75% {
			transform: rotate(-5deg);
		}
		100% {
			transform: rotate(0deg);
		}
	}
</style>
