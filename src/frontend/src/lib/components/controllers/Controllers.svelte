<script lang="ts">
	import { onMount } from 'svelte';
	import type { Principal } from '@dfinity/principal';
	import { toasts } from '$lib/stores/toasts.store';
	import { i18n } from '$lib/stores/i18n.store';
	import ButtonDelete from '$lib/components/ui/ButtonDelete.svelte';
	import type { Controller } from '$declarations/mission_control/mission_control.did';
	import { metadataProfile } from '$lib/utils/metadata.utils';
	import ControllerDelete from '$lib/components/controllers/ControllerDelete.svelte';

	export let list: () => Promise<[Principal, Controller][]>;
	export let remove: (params: {
		missionControlId: Principal;
		controller: Principal;
	}) => Promise<void>;

	// The canister and user are controllers of the mission control but not added in its state per default
	export let extraControllers: [Principal, Controller | undefined][] = [];

	let controllers: [Principal, Controller | undefined][] = [];

	const load = async () => {
		try {
			controllers = [...(await list()), ...extraControllers];
		} catch (err: unknown) {
			toasts.error({
				text: $i18n.errors.controllers_listing,
				detail: err
			});
		}
	};

	onMount(async () => await load());

	let visible = false;
	let selectedController: Principal | undefined;
</script>

<div class="table-container">
	<table>
		<thead>
			<tr>
				<th class="tools" />
				<th class="controller"> {$i18n.controllers.title} </th>
				<th> {$i18n.controllers.profile} </th>
			</tr>
		</thead>
		<tbody>
			{#each controllers as [controllerId, controller] (controllerId.toText())}
				<tr>
					<td class="actions">
						<ButtonDelete
							ariaLabel={$i18n.controllers.delete}
							on:click={() => {
								selectedController = controllerId;
								visible = true;
							}}
						/>
					</td><td>
						<span>{controllerId.toText()}</span>
					</td>

					<td>{metadataProfile(controller?.metadata ?? [])}</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<ControllerDelete bind:selectedController bind:visible {load} {remove} />

<style lang="scss">
	@use '../../styles/mixins/media';

	.tools {
		width: 88px;
	}

	.controllers {
		@include media.min-width(small) {
			width: 60%;
		}
	}
</style>
