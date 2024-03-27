<script lang="ts">
	import { i18n } from '$lib/stores/i18n.store.js';
	import type { Log } from '$lib/types/log';
	import { i18nText } from '$lib/utils/i18n.utils';

	export let log: Log;
</script>

<span
	class:error={log.level === 'Error'}
	class:warning={log.level === 'Warning'}
	class:debug={log.level === 'Debug'}
>
	{i18nText({ i18n: $i18n, labelKey: `functions.${log.level.toLowerCase()}` })}
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
