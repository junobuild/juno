<script lang="ts">
	import { i18n } from '$lib/stores/i18n.store';
</script>

<div class="card-container with-title">
	<span class="title">{$i18n.analytics.start}</span>

	<div class="content">
		<p>{$i18n.analytics.empty}</p>
	</div>
</div>

<style lang="scss">
	p {
		width: calc(100% - var(--padding-6x));
	}
</style>
