<script lang="ts">
	import { i18n } from '$lib/stores/i18n.store.js';
	import type { Log } from '$lib/types/log';

	export let log: Log;
</script>

<span
	class:error={log.level === 'error'}
	class:warning={log.level === 'warning'}
	class:debug={log.level === 'debug'}
>
	{$i18n.functions[log.level]}
</span>

<style lang="scss">
	span {
		--padding-0_75x: calc(var(--padding) / 1.25);

		padding: 0 var(--padding);
		margin: var(--padding-0_75x) 0;

		display: inline-block;

		border-radius: var(--border-radius);

		background: var(--color-secondary);
		color: var(--color-secondary-contrast);

		font-size: var(--font-size-very-small);
	}

	.debug {
		background: var(--color-tertiary);
		color: var(--color-tertiary-contrast);
	}

	.warning {
		background: var(--color-warning);
		color: var(--color-warning-contrast);
	}

	.error {
		background: var(--color-error);
		color: var(--color-error-contrast);
	}
</style>
