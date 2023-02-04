<script lang="ts">
	import { APP_VERSION } from '$lib/constants/constants';
</script>

<span class="version">Papyrs v{APP_VERSION}</span>

<style lang="scss">
	span {
		color: var(--color-card);
		font-size: calc(var(--font-size-very-small) * 0.8);
		margin-top: 0.75rem;
	}
</style>
