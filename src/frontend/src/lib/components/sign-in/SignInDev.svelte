<script lang="ts">
	import { fade } from 'svelte/transition';
	import { isBusy } from '$lib/derived/app/busy.derived';
	import { signInWithGoogle } from '$lib/services/console/auth/auth.openid.services';
	import { isDev } from '$lib/env/app.env';
	import IconRobot from '$lib/components/icons/IconRobot.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import Badge from "$lib/components/ui/Badge.svelte";
	import {signInWithDev} from "$lib/services/console/auth/auth.dev.services";

	let mode = $state<'continue' | 'switch'>('continue');
	let devKey = $state('');

	export const signIn = async () => {
		await signInWithDev({});
	}
</script>

{#if isDev()}
	{#if mode === 'switch'}
		<div in:fade>
			<div>
				<Value>
					{#snippet label()}
						Dev Identifier
					{/snippet}

					<Input
							name="dev_key"
							inputType="text"
							placeholder="e.g. david"
							required={false}
							bind:value={devKey}
					/>
				</Value>
			</div>

			<button disabled={$isBusy} onclick={signInWithGoogle}><span>Continue</span></button>


			<p>Recent:</p>

			<ul>
				<li><Badge color="primary">David</Badge></li>
				<li><Badge color="primary">Yolo</Badge></li>
				<li><Badge color="primary">Hello</Badge></li>
				<li><Badge color="primary">World</Badge></li>
			</ul>
		</div>
	{:else}
		<button disabled={$isBusy} onclick={signIn}
			><IconRobot size="20px" />
			<span>Continue with Dev</span></button
		>

		<p>or <button class="text" onclick={() => (mode = 'switch')}>switch account</button></p>
	{/if}
{/if}

<style lang="scss">
	button {
		width: 100%;
		padding: var(--padding) var(--padding-3x);
	}

	p {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: var(--padding-0_5x);

		font-size: var(--font-size-very-small);
		margin: var(--padding-0_25x) 0;
	}

	.text {
		width: fit-content;
		margin: 0;
	}
</style>
