<script lang="ts">
	import SignInGoogle from '$lib/components/sign-in/SignInGoogle.svelte';
	import SignInII from '$lib/components/sign-in/SignInII.svelte';
</script>

<div class="sign-in">
	<SignInGoogle />

	<SignInII />
</div>

<style lang="scss">
	.sign-in {
		display: flex;
		flex-direction: column;

		width: fit-content;
	}
</style>
