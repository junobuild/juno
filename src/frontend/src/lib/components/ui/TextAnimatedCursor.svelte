<script lang="ts">
	const loaders = ['/', '\\', '@', '#', '%'];
	const randomLoader = (): string => loaders[Math.floor(Math.random() * loaders.length)];

	let loader = $state(randomLoader());

	$effect(() => {
		const interval = setInterval(() => {
			loader = randomLoader();
		}, 50);

		return () => clearInterval(interval);
	});
</script>

<span>{loader}</span>
