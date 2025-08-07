<script lang="ts">
	import SignInHelp from '$lib/components/core/SignInHelp.svelte';
	import IconIc from '$lib/components/icons/IconIC.svelte';
	import ContainerCentered from '$lib/components/ui/ContainerCentered.svelte';
	import { signIn } from '$lib/services/auth/auth.services';
	import { isBusy } from '$lib/stores/busy.store';
	import { i18n } from '$lib/stores/i18n.store';
	import Test from '$lib/components/ui/Test.svelte';
	import {testIds} from "$lib/constants/test-ids.constants";

	let quotes: string[] = $derived([
		$i18n.sign_in.quote_1,
		$i18n.sign_in.quote_2,
		$i18n.sign_in.quote_3,
		$i18n.sign_in.quote_4,
		$i18n.sign_in.quote_5,
		$i18n.sign_in.quote_6,
		$i18n.sign_in.quote_7,
		$i18n.sign_in.quote_8,
		$i18n.sign_in.quote_9,
		$i18n.sign_in.quote_10
	]);

	let title: string = $derived(quotes[Math.floor(Math.random() * quotes.length)]);
</script>

<ContainerCentered>
	<h1>{title}</h1>

	{#snippet action()}
		<Test testId={testIds.auth.signIn}>
			<button disabled={$isBusy} onclick={async () => await signIn({})}
				><IconIc size="20px" />
				<span>{$i18n.sign_in.internet_identity}</span></button
			>
		</Test>
	{/snippet}
</ContainerCentered>

<div class="pre-footer">
	<SignInHelp />
</div>

<style lang="scss">
	@use '../../../lib/styles/mixins/media';

	h1 {
		padding: 0;

		--bigger-title: 1.2;
		font-size: calc(var(--font-size-h1) * var(--bigger-title));

		max-width: 420px;

		@include media.min-width(large) {
			--bigger-title: 1.4;
		}
	}

	button {
		padding: var(--padding) var(--padding-2x);
	}

	.pre-footer {
		display: flex;
		justify-content: center;
	}
</style>
