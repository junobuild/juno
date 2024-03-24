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
	.error {
		background: var(--color-error);
		color: var(--color-error-contrast);

		padding: 0 var(--padding);
		margin: var(--padding-0_5x) 0;

		display: inline-block;

		border-radius: var(--border-radius);
	}
</style>
