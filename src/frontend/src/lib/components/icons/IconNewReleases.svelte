<!-- source: https://fonts.google.com/icons?selected=Material%20Symbols%20Sharp%3Anew_releases%3AFILL%401%3Bwght%40400%3BGRAD%400%3Bopsz%4024 -->
<script lang="ts">
	interface Props {
		size?: string;
	}

	let { size = '32px' }: Props = $props();
</script>

<svg fill="currentColor" height={size} width={size} xmlns="http://www.w3.org/2000/svg"
	><path
		d="m8.6 22.5-1.9-3.2-3.6-.8.35-3.7L1 12l2.45-2.8-.35-3.7 3.6-.8 1.9-3.2L12 2.95l3.4-1.45 1.9 3.2 3.6.8-.35 3.7L23 12l-2.45 2.8.35 3.7-3.6.8-1.9 3.2-3.4-1.45Zm2.35-6.95L16.6 9.9l-1.4-1.45-4.25 4.25-2.15-2.1L7.4 12Z"
	/></svg
>

<style lang="scss">
	svg {
		vertical-align: middle;
	}
</style>
