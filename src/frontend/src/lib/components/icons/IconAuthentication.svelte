<!-- CC BY-NC-SA - Didier Renaud - https://www.customfuture.com/ -->
<script lang="ts">
	interface Props {
		size?: string;
	}

	let { size = '48px' }: Props = $props();
</script>

<svg height={size} viewBox="0 0 29 29" width={size} xmlns="http://www.w3.org/2000/svg"
	><g
		><g
			><rect class="icon-authentication-1" height="29" width="29" /><rect
				class="icon-authentication-2"
				height="16.18"
				width="19.36"
				x="4.82"
				y="11.44"
			/><path
				class="icon-authentication-3"
				d="m24.18,10.44h-3.4v-3.79c0-3.46-2.82-6.28-6.28-6.28s-6.28,2.82-6.28,6.28c0,.55.45,1,1,1s1-.45,1-1c0-2.36,1.92-4.28,4.28-4.28s4.28,1.92,4.28,4.28v3.79H4.82c-.55,0-1,.45-1,1v16.18c0,.55.45,1,1,1h19.36c.55,0,1-.45,1-1V11.44c0-.55-.45-1-1-1Zm-1,16.18H5.82v-14.18h17.36v14.18Z"
			/><path
				class="icon-authentication-3"
				d="m16.84,21.63l-.76-1.31c.45-.42.73-1.02.73-1.68,0-1.28-1.04-2.32-2.32-2.32s-2.32,1.04-2.32,2.32c0,.66.28,1.26.73,1.68l-.76,1.31c-.18.31-.18.69,0,1s.51.5.87.5h2.96c.36,0,.69-.19.87-.5s.18-.69,0-1Z"
			/></g
		></g
	></svg
>

<style lang="scss">
	.icon-authentication-1 {
		fill: none;
		opacity: 0.25;
	}

	.icon-authentication-2 {
		fill: var(--color-background);
	}

	.icon-authentication-3 {
		fill: var(--color-background-contrast);
	}
</style>
