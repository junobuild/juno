<script lang="ts">
	import TextAnimatedCursor from '$lib/components/ui/TextAnimatedCursor.svelte';

	interface Props {
		text: string;
	}

	let { text }: Props = $props();

	interface Text {
		value: string;
		status: 'hidden' | 'loading' | 'visible';
	}

	let count = $state(0);

	let animated = $derived(count < text.length);

	$effect(() => {
		const interval = setInterval(() => {
			if (!animated) {
				clearInterval(interval);
				return;
			}

			count += 1;
		}, 100);

		return () => clearInterval(interval);
	});

	let chars = $derived(
		text.split('').map<Text>((char, index) => ({
			value: char,
			status: index === count ? 'loading' : index < count ? 'visible' : 'hidden'
		}))
	);
</script>

{#each chars as char, index (index)}
	{#if char.status === 'loading' && animated}
		<TextAnimatedCursor />
	{:else if char.status === 'visible'}
		<span>{char.value}</span>
	{/if}
{/each}
