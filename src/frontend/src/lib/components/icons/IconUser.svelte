<!-- CC BY-NC-SA - Didier Renaud - https://www.customfuture.com/ -->
<script lang="ts">
	interface Props {
		size?: string;
	}

	let { size = '24px' }: Props = $props();
</script>

<svg height={size} viewBox="0 0 34 38" width={size} xmlns="http://www.w3.org/2000/svg"
	><g
		><g
			><path
				class="icon-user"
				d="m3.26,34.15h0c0-7.17,5.9-12.98,13.17-12.98h1.14c7.28,0,13.17,5.81,13.17,12.98h0s-2.74,2.85-13.53,2.85-13.95-2.85-13.95-2.85Z"
			/><path
				class="icon-user"
				d="m27.55,19.59l2.73-.59c1.64-.35,2.72-1.24,2.72-2.23v-5.68c0-.99-1.08-1.88-2.72-2.23l-2.73-.59v11.33Z"
			/><path
				class="icon-user"
				d="m6.45,19.59l-2.73-.59c-1.64-.35-2.72-1.24-2.72-2.23v-5.68c0-.99,1.08-1.88,2.72-2.23l2.73-.59v11.33Z"
			/><ellipse class="icon-user" cx="17" cy="13.14" rx="12.33" ry="12.15" /><path
				d="m30.49,7.88l-1.44-.31C26.92,3.11,22.33,0,17,0S7.08,3.11,4.95,7.57l-1.44.31c-2.13.46-3.51,1.72-3.51,3.2v5.68c0,1.49,1.38,2.74,3.51,3.2l2.47.53c.6.88,1.32,1.67,2.12,2.37-3.53,2.54-5.83,6.64-5.83,11.27,0,.28.12.55.33.74.14.13,3.57,3.11,14.62,3.11s13.94-2.84,14.25-3.16c.18-.18.28-.43.28-.69,0-4.63-2.31-8.72-5.83-11.26.8-.71,1.52-1.5,2.12-2.38l2.47-.53c2.13-.46,3.51-1.72,3.51-3.2v-5.68c0-1.49-1.38-2.74-3.51-3.2ZM17,1.99c4.87,0,9.03,3.05,10.63,7.3-2.31-1.95-6.17-3.2-10.63-3.2s-8.31,1.25-10.62,3.2c1.6-4.25,5.75-7.3,10.62-7.3ZM3.93,18.03c-1.34-.29-1.94-.91-1.94-1.26v-5.68c0-.35.6-.97,1.94-1.26l.21-.05c-.29,1.07-.46,2.2-.46,3.36,0,1.79.37,3.5,1.03,5.06l-.78-.17Zm25.81,15.64c-.94.63-4.28,2.34-12.53,2.34s-11.89-1.73-12.95-2.37c.17-3.97,2.33-7.43,5.51-9.48,2.08,1.33,4.56,2.12,7.23,2.12s5.16-.79,7.24-2.13c3.18,2.06,5.33,5.54,5.49,9.53Zm-12.74-9.38c-4.28,0-8.01-2.35-9.94-5.8,2.35,1.64,5.9,2.67,9.94,2.67s7.59-1.03,9.94-2.67c-1.93,3.46-5.66,5.8-9.94,5.8Zm15.01-7.52c0,.35-.6.97-1.94,1.26l-.78.17c.66-1.56,1.03-3.27,1.03-5.06,0-1.16-.17-2.29-.46-3.36l.21.05c1.34.29,1.94.91,1.94,1.26v5.68Z"
			/></g
		></g
	></svg
>

<style lang="scss">
	.icon-user {
		fill: var(--color-background);
	}

	path {
		fill: var(--color-background-contrast);
	}
</style>
