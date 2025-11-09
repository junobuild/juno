<!-- source: https://fonts.google.com/icons?selected=Material%20Icons%20Sharp%3Anavigate_next%3A -->
<script lang="ts">
	interface Props {
		navigate?: 'next' | 'previous';
	}

	let { navigate = 'next' }: Props = $props();
</script>

<svg
	class:previous={navigate === 'previous'}
	fill="currentColor"
	height="24px"
	viewBox="0 0 24 24"
	width="24px"
	xmlns="http://www.w3.org/2000/svg"
	><path d="M0 0h24v24H0V0z" fill="none" /><path
		d="M10.02 6L8.61 7.41 13.19 12l-4.58 4.59L10.02 18l6-6-6-6z"
	/></svg
>

<style lang="scss">
	.previous {
		transform: rotate(180deg);
	}
</style>
