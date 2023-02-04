<script lang="ts">
	import Spinner from '$lib/components/ui/Spinner.svelte';
</script>

<div class="msg">
	<Spinner inline />
	<slot />
</div>

<style lang="scss">
	@use '../../styles/mixins/overlay';

	.msg {
		@include overlay.message;
	}
</style>
