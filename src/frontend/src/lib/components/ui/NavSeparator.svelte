<script lang="ts">
	interface Props {
		visible?: boolean;
	}

	let { visible = false }: Props = $props();
</script>

{#if visible}
	<span class="separator" role="presentation">&nbsp;</span>
{/if}

<style lang="scss">
	@use '../../styles/mixins/media';

	.separator {
		display: inline-block;
		width: var(--padding-3x);

		&::before {
			content: '\003E';
		}

		@include media.min-width(large) {
			width: calc(var(--padding-2x) + var(--padding-0_5x));

			&::before {
				content: '\003E';
			}
		}
	}
</style>
