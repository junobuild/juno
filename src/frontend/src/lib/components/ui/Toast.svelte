<script lang="ts">
	import { toasts } from '$lib/stores/toasts.store';
	import { fade, fly } from 'svelte/transition';
	import type { ToastLevel, ToastMsg } from '$lib/types/toast';
	import { i18n } from '$lib/stores/i18n.store';
	import IconClose from '$lib/components/icons/IconClose.svelte';
	import { onDestroy, onMount } from 'svelte';

	export let msg: ToastMsg;

	const close = () => toasts.hide();

	let text: string;
	let level: ToastLevel;
	let detail: string | undefined;

	$: ({ text, level, detail } = msg);

	let timer: number | undefined;

	onMount(() => {
		const { duration } = msg;

		if (!duration || duration <= 0) {
			return;
		}

		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore NodeJS.timeout vs number
		timer = setTimeout(close, duration);
	});

	onDestroy(() => clearTimeout(timer));
</script>

<div
	role="dialog"
	class="toast"
	class:error={level === 'error'}
	class:warn={level === 'warn'}
	in:fly={{ y: 100, duration: 200 }}
	out:fade={{ delay: 100 }}
>
	<p title={text}>
		{text}{detail ? ` ${detail}` : ''}
	</p>

	<button class="text" on:click={close} aria-label={$i18n.core.close}><IconClose /></button>
</div>

<style lang="scss">
	@use '../../styles/mixins/text';
	@use '../../styles/mixins/shadow';

	.toast {
		display: flex;
		justify-content: space-between;
		align-items: center;

		position: fixed;
		bottom: calc(2 * var(--padding));
		left: 50%;
		transform: translate(-50%, 0);

		@include shadow.shadow;

		background: var(--color-card);
		color: var(--color-card-contrast);

		width: calc(100% - (8 * var(--padding)));

		padding: var(--padding) calc(var(--padding) * 2);
		box-sizing: border-box;

		z-index: calc(var(--z-index) + 999);

		@media (min-width: 768px) {
			max-width: var(--section-max-width);
		}

		background: var(--color-primary);
		color: var(--color-primary-contrast);

		&.error {
			background: var(--color-error);
			color: var(--color-error-contrast);
		}

		&.warn {
			background: var(--color-warning);
			color: var(--color-warning-contrast);
		}
	}

	p {
		@include text.clamp(4);

		margin: 0;
		font-size: 1rem;

		@media (min-width: 768px) {
			@include text.clamp(3);
		}
	}
</style>
