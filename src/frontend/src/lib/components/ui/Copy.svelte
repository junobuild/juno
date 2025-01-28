<script lang="ts">
	import { isNullish } from '@dfinity/utils';
	import IconCopy from '$lib/components/icons/IconCopy.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import { toasts } from '$lib/stores/toasts.store';

	interface Props {
		value: string;
		variant?: 'square' | 'text';
		confirmText?: string;
	}

	let { value, variant = 'square', confirmText }: Props = $props();

	const copyToClipboard = async ($event: UIEvent) => {
		$event.stopPropagation();

		await navigator.clipboard.writeText(value);

		showConfirmation();
	};

	const showConfirmation = () => {
		if (isNullish(confirmText)) {
			return;
		}

		toasts.show({ text: confirmText, level: 'info', duration: 2000 });
	};
</script>

<button
	onclick={copyToClipboard}
	aria-label={`${$i18n.core.copy}: ${value}`}
	title={`${$i18n.core.copy}: ${value}`}
	class:square={variant === 'square'}
	class:text={variant === 'text'}
>
	<IconCopy />
</button>
