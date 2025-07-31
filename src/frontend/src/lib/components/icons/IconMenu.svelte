<!-- https://fonts.google.com/icons?selected=Material%20Icons%20Round%3Amenu%3A -->
<script lang="ts">
	interface Props {
		size?: string;
	}

	let { size = '24px' }: Props = $props();
</script>

<svg
	fill="currentColor"
	height={size}
	viewBox="0 0 24 24"
	width={size}
	xmlns="http://www.w3.org/2000/svg"
	><path d="M0 0h24v24H0V0z" fill="none" /><path
		d="M4 18h16c.55 0 1-.45 1-1s-.45-1-1-1H4c-.55 0-1 .45-1 1s.45 1 1 1zm0-5h16c.55 0 1-.45 1-1s-.45-1-1-1H4c-.55 0-1 .45-1 1s.45 1 1 1zM3 7c0 .55.45 1 1 1h16c.55 0 1-.45 1-1s-.45-1-1-1H4c-.55 0-1 .45-1 1z"
	/></svg
>
