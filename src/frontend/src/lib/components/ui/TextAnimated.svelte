<script lang="ts">
	import * as z from 'zod';
	import TextAnimatedCursor from '$lib/components/ui/TextAnimatedCursor.svelte';

	interface Props {
		text: string;
	}

	let { text }: Props = $props();

	const TextSchema = z.strictObject({
		value: z.string().min(1).max(1),
		status: z.literal(['hidden', 'loading', 'visible'])
	});

	type Text = z.infer<typeof TextSchema>;

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
