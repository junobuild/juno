<script lang="ts">
	import { isNullish } from '@dfinity/utils';
	import { onDestroy, untrack } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import IconClose from '$lib/components/icons/IconClose.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import { toasts } from '$lib/stores/toasts.store';
	import type { ToastColor, ToastLevel, ToastMsg } from '$lib/types/toast';

	interface Props {
		msg: ToastMsg;
	}

	let { msg }: Props = $props();

	const close = () => toasts.hide();

	let text: string = $derived(msg.text);
	let level: ToastLevel = $derived(msg.level);
	let detail: string | undefined = $derived(msg.detail);
	let color: ToastColor | undefined = $derived(msg.color);

	let timer = $state<number | undefined>(undefined);

	$effect(() => {
		const { duration } = msg;

		untrack(() => {
			if (isNullish(duration) || duration <= 0) {
				return;
			}

			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore NodeJS.timeout vs number
			timer = setTimeout(close, duration);
		});
	});

	onDestroy(() => clearTimeout(timer));

	let reorgDetail: string | undefined = $state(undefined);
	$effect(() => {
		if (isNullish(detail)) {
			reorgDetail = undefined;
			return;
		}

		// Present the message we throw in the backend first
		const trapKeywords = 'trapped explicitly:';

		if (!detail.includes(trapKeywords)) {
			reorgDetail = detail;
			return;
		}

		const splits = detail.split(trapKeywords);
		const last = splits.splice(-1);
		reorgDetail = `${last[0]?.trim() ?? ''}${
			splits.length > 0 ? ` | Stacktrace: ${splits.join('').trim()}` : ''
		}`;
	});
</script>

<div
	class={`toast ${color ?? ''}`}
	class:error={level === 'error'}
	class:warn={level === 'warn'}
	role="dialog"
	in:fly={{ y: 100, duration: 200 }}
	out:fade={{ delay: 100 }}
>
	<div class="toast-scroll">
		<p title={text}>
			{text}{reorgDetail ? ` | ${reorgDetail}` : ''}
		</p>
	</div>

	<button class="text" aria-label={$i18n.core.close} onclick={close}><IconClose /></button>
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

		width: calc(100% - (8 * var(--padding)));

		padding: var(--padding) calc(var(--padding) * 2);
		box-sizing: border-box;

		z-index: calc(var(--z-index) + 999);

		background: var(--color-primary);
		color: var(--color-primary-contrast);

		@include shadow.shadow;

		@media (min-width: 768px) {
			max-width: 576px;
		}

		&.secondary {
			background: var(--color-secondary);
			color: var(--color-secondary-contrast);
		}

		&.tertiary {
			background: var(--color-tertiary);
			color: var(--color-tertiary-contrast);
		}

		&.success {
			background: var(--color-success);
			color: var(--color-success-contrast);
		}

		&.warn {
			background: var(--color-warning);
			color: var(--color-warning-contrast);
		}

		&.error {
			background: var(--color-error);
			color: var(--color-error-contrast);
		}

		&.warn {
			background: var(--color-warning);
			color: var(--color-warning-contrast);
		}
	}

	.toast-scroll {
		overflow-y: auto;
		max-height: calc(16px * 3 * 1.3);

		// Workaround to get rid of the redundant scrollbar (even when there is enough space).
		line-height: normal;

		direction: rtl;

		&::-webkit-scrollbar-thumb {
			background: var(--color-primary-contrast);
		}

		p {
			direction: ltr;

			margin: 0;
			padding: 0 var(--padding);
		}
	}
</style>
