<script lang="ts">
	import { notEmptyString } from '@dfinity/utils';
	import IconCopy from '$lib/components/icons/IconCopy.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import { toasts } from '$lib/stores/toasts.store';

	interface Props {
		value: string;
		variant?: 'square' | 'text';
		what?: string;
	}

	let { value, variant = 'square', what }: Props = $props();

	let actionLabel = $derived(
		`${$i18n.core.copy}${notEmptyString(what) ? ` ${what}` : ''}: ${value}`
	);
	let confirmLabel = $derived(
		`${notEmptyString(what) ? `${what} ` : ''}${value} ${$i18n.core.copied}`
	);

	const copyToClipboard = async ($event: UIEvent) => {
		$event.stopPropagation();

		await navigator.clipboard.writeText(value);

		toasts.show({ text: confirmLabel, level: 'info', duration: 2000 });
	};
</script>

<button
	onclick={copyToClipboard}
	aria-label={actionLabel}
	title={actionLabel}
	class:square={variant === 'square'}
	class:text={variant === 'text'}
>
	<IconCopy />
</button>
