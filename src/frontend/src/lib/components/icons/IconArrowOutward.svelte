<!-- source: https://fonts.google.com/icons?selected=Material%20Symbols%20Rounded%3Aarrow_outward%3AFILL%400%3Bwght%40400%3BGRAD%400%3Bopsz%4048 -->
<script lang="ts">
	interface Props {
		size?: string;
	}

	let { size = '14px' }: Props = $props();
</script>

<svg
	fill="currentColor"
	height={size}
	viewBox="0 96 960 960"
	width={size}
	xmlns="http://www.w3.org/2000/svg"
	><path
		d="M660 398 269 789q-8.8 9-20.9 9-12.1 0-21.1-9.053-9-9.052-9-21.5Q218 755 227 746l391-390H270q-12.75 0-21.375-8.675-8.625-8.676-8.625-21.5 0-12.825 8.625-21.325T270 296h420q12.75 0 21.375 8.625T720 326v420q0 12.75-8.675 21.375-8.676 8.625-21.5 8.625-12.825 0-21.325-8.625T660 746V398Z"
	/></svg
>

<style lang="scss">
	svg {
		min-width: 14px;
		margin: var(--padding-0_25x) 0 0;
	}
</style>
