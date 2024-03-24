<script lang="ts">
	import { i18n } from '$lib/stores/i18n.store.js';
	import type { Log } from '$lib/types/log';

	export let log: Log;
</script>

<span class="error">{$i18n.functions.error}</span>

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
