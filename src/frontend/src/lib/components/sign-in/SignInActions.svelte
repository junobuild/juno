<script lang="ts">
	import SignInGoogle from '$lib/components/sign-in/SignInGoogle.svelte';
	import SignInII from '$lib/components/sign-in/SignInII.svelte';
	import SignInGitHub from '$lib/components/sign-in/SignInGitHub.svelte';
</script>

<div class="sign-in">
	<SignInGoogle />

	<SignInGitHub />

	<SignInII />
</div>

<style lang="scss">
	.sign-in {
		display: flex;
		flex-direction: column;

		width: fit-content;
	}
</style>
