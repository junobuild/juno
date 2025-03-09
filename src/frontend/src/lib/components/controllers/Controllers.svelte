<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import { nonNullish } from '@dfinity/utils';
	import { onMount } from 'svelte';
	import type { Controller } from '$declarations/mission_control/mission_control.did';
	import ControllerAdd from '$lib/components/controllers/ControllerAdd.svelte';
	import ControllerDelete from '$lib/components/controllers/ControllerDelete.svelte';
	import ControllerInfo from '$lib/components/controllers/ControllerInfo.svelte';
	import ButtonTableAction from '$lib/components/ui/ButtonTableAction.svelte';
	import Identifier from '$lib/components/ui/Identifier.svelte';
	import { missionControlIdDerived } from '$lib/derived/mission-control.derived';
	import { authStore } from '$lib/stores/auth.store';
	import { i18n } from '$lib/stores/i18n.store';
	import { toasts } from '$lib/stores/toasts.store';
	import type { CanisterSegmentWithLabel } from '$lib/types/canister';
	import type { SetControllerParams } from '$lib/types/controllers';
	import type { MissionControlId } from '$lib/types/mission-control';
	import { metadataProfile } from '$lib/utils/metadata.utils';

	interface Props {
		list: () => Promise<[Principal, Controller][]>;
		remove: (params: {
			missionControlId: MissionControlId;
			controller: Principal;
		}) => Promise<void>;
		add: (
			params: {
				missionControlId: MissionControlId;
			} & SetControllerParams
		) => Promise<void>;
		segment: CanisterSegmentWithLabel;
		// The canister and user are controllers of the mission control but not added in its state per default
		extraControllers?: [Principal, Controller | undefined][];
	}

	let { list, remove, add, segment, extraControllers = [] }: Props = $props();

	let controllers: [Principal, Controller | undefined][] = $state([]);

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

	let visibleDelete = $state(false);
	let visibleInfo = $state(false);
	let selectedController: [Principal, Controller | undefined] | undefined = $state();

	const canEdit = (controllerId: Principal): boolean =>
		nonNullish($authStore.identity) &&
		nonNullish($missionControlIdDerived) &&
		![$missionControlIdDerived.toText(), $authStore.identity.getPrincipal().toText()].includes(
			controllerId.toText()
		);
</script>

<div class="table-container">
	<table>
		<thead>
			<tr>
				<th class="tools"></th>
				<th class="controller"> {$i18n.controllers.title} </th>
				<th class="profile"> {$i18n.controllers.profile} </th>
				<th class="scope"> {$i18n.controllers.scope} </th>
			</tr>
		</thead>
		<tbody>
			{#each controllers as [controllerId, controller] (controllerId.toText())}
				<tr>
					<td class="actions">
						{#if canEdit(controllerId)}
							<ButtonTableAction
								icon="delete"
								ariaLabel={$i18n.controllers.delete}
								onaction={() => {
									selectedController = [controllerId, controller];
									visibleDelete = true;
								}}
							/>
						{:else}
							<ButtonTableAction
								icon="info"
								ariaLabel={$i18n.controllers.info}
								onaction={() => (visibleInfo = true)}
							/>
						{/if}
					</td>

					<td>
						<Identifier identifier={controllerId.toText()} shorten={false} small={false} />
					</td>

					<td class="profile"
						>{metadataProfile(nonNullish(controller) ? controller.metadata : [])}</td
					>

					<td class="scope">
						{#if nonNullish(controller)}
							{#if nonNullish(controller) && 'Write' in controller.scope}
								{$i18n.controllers.write}
							{:else}
								{$i18n.controllers.admin}
							{/if}{/if}</td
					>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<ControllerAdd {add} {load} {segment} />

<ControllerDelete bind:selectedController bind:visible={visibleDelete} {load} {remove} />

<ControllerInfo bind:visible={visibleInfo} />

<style lang="scss">
	@use '../../styles/mixins/media';

	.tools {
		width: 48px;
	}

	.controller {
		@include media.min-width(small) {
			width: 60%;
		}
	}

	.profile,
	.scope {
		display: none;

		@include media.min-width(small) {
			display: table-cell;
		}
	}
</style>
