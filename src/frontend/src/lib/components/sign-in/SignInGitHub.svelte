<script lang="ts">
	import IconGoogle from '$lib/components/icons/IconGoogle.svelte';
	import { isBusy } from '$lib/derived/app/busy.derived';
	import { i18n } from '$lib/stores/app/i18n.store';
	import IconGitHub from '$lib/components/icons/IconGitHub.svelte';

	const signInWithGitHub = async () => {
		const clientId = 'Ov23li92ijrrPEfwUrqW';

		const {
			location: { origin }
		} = window;

		const redirectUri = `${origin}/auth/callback/github`;

		const scope = 'read:user repo';

		const { state } = await fetch(
			`http://localhost:3000/v1/auth/init/github?nonce=${'X'.repeat(32)}`,
			{
				credentials: 'include'
			}
		).then((r) => r.json());

		const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&state=${state}`;

		window.location.href = githubAuthUrl;
	};
</script>

<button disabled={$isBusy} onclick={signInWithGitHub}
	><IconGitHub size="20px" />
	<span>{$i18n.sign_in.github}</span></button
>

<style lang="scss">
	button {
		width: 100%;
		padding: var(--padding) var(--padding-3x);
	}
</style>
