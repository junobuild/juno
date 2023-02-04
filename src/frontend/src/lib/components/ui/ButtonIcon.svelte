<script lang="ts">
	export let button: HTMLButtonElement | undefined = undefined;
	export let disabled = false;
	export let hidden = false;
</script>

<button type="button" on:click bind:this={button} class="icon" {disabled} class:hidden>
	<slot name="icon" />
	<span class="visually-hidden"><slot /></span>
</button>

<style lang="scss">
	.hidden {
		display: none;
	}
</style>
