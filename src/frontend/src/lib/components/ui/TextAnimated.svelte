<script lang="ts">
	import * as z from 'zod';

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

	$effect(() => {
		const interval = setInterval(() => {
			count += 1;
		}, 100);

		return () => {
			clearInterval(interval);
		};
	});

	let chars = $derived(
		text.split('').map<Text>((char, index) => ({
			value: char,
			status: index === count ? 'loading' : index < count ? 'visible' : 'hidden'
		}))
	);

	const loaders = ['/', '\\', '@', '#', '%'];
	const randomLoader = (): string => loaders[Math.floor(Math.random() * loaders.length)];

	let loader = $state(randomLoader());

	$effect(() => {
		const interval = setInterval(() => {
			loader = randomLoader();
		}, 50);

		return () => {
			clearInterval(interval);
		};
	});
</script>

{#each chars as char, index (index)}
	{#if char.status === 'loading'}
		<span>{loader}</span>
	{:else if char.status === 'visible'}
		<span>{char.value}</span>
	{/if}
{/each}
