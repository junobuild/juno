<script lang="ts">
	import { debounce, nonNullish, notEmptyString } from '@dfinity/utils';
	import { Principal } from '@icp-sdk/core/principal';
	import { type Snippet, untrack } from 'svelte';
	import Value from '$lib/components/ui/Value.svelte';

	interface Props {
		canisterId: string;
		valid: boolean;
		disabled: boolean;
		label: Snippet;
	}

	let { disabled, canisterId = $bindable(''), valid = $bindable(false), label }: Props = $props();

	const assertCanister = debounce(() => {
		try {
			valid = notEmptyString(canisterId) && nonNullish(Principal.fromText(canisterId));
		} catch (_err: unknown) {
			valid = false;
		}
	});

	$effect(() => {
		canisterId;

		untrack(() => {
			assertCanister();
		});
	});
</script>

<Value {label} ref="canisterId">
	<input
		id="canisterId"
		autocomplete="off"
		data-1p-ignore
		{disabled}
		maxlength={64}
		placeholder="_____-_____-_____-_____-cai"
		type="text"
		bind:value={canisterId}
	/>
</Value>
