<script lang="ts">
	interface Props {
		src: string;
		alt: string;
		size?: string;
	}

	let { src, alt, size = '100%' }: Props = $props();
</script>

<picture style={`--avatar-size: ${size}`}
	><img {alt} loading="lazy" referrerPolicy="no-referrer" {src} /></picture
>

<style lang="scss">
	picture {
		display: block;

		width: var(--avatar-size);
		min-width: var(--avatar-size);
		height: var(--avatar-size);

		border-radius: 50%;
		overflow: hidden;
	}
</style>
