<script lang="ts">
	import { notEmptyString } from '@dfinity/utils';
	import IconCopy from '$lib/components/icons/IconCopy.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import { toasts } from '$lib/stores/toasts.store';
	import type { TestId } from '$lib/types/test-id';
	import { testId } from '$lib/utils/test.utils';

	interface Props {
		value: string;
		variant?: 'square' | 'text';
		what?: string;
		testId?: TestId;
	}

	let { value, variant = 'square', what, testId: testIdProp }: Props = $props();

	let actionLabel = $derived(
		`${$i18n.core.copy}${notEmptyString(what) ? ` ${what}` : ''}: ${value}`
	);
	let confirmLabel = $derived(
		`${notEmptyString(what) ? `${what} ` : ''}${value} ${$i18n.core.copied}`
	);

	const copyToClipboard = async ($event: UIEvent) => {
		$event.preventDefault();

		await navigator.clipboard.writeText(value);

		toasts.show({ text: confirmLabel, level: 'info', duration: 2000 });
	};
</script>

<button
	class:square={variant === 'square'}
	class:text={variant === 'text'}
	aria-label={actionLabel}
	onclick={copyToClipboard}
	title={actionLabel}
	{...testId(testIdProp)}
>
	<IconCopy />
</button>
