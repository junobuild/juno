<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import { nonNullish } from '@dfinity/utils';
	import { onMount } from 'svelte';
	import type { MissionControlDid } from '$declarations';
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
		list: () => Promise<[Principal, MissionControlDid.Controller][]>;
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
		extraControllers?: [Principal, MissionControlDid.Controller][];
	}

	let { list, remove, add, segment, extraControllers = [] }: Props = $props();

	let controllers = $state<[Principal, MissionControlDid.Controller][]>([]);

	const load = async () => {
		try {
			controllers = [...(await list()), ...extraControllers].sort((controllerA, controllerB) =>
				Object.keys(controllerA[1]?.scope ?? {})[0].localeCompare(
					Object.keys(controllerB[1]?.scope ?? {})[0]
				)
			);
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
	let selectedController = $state<
		[Principal, MissionControlDid.Controller | undefined] | undefined
	>(undefined);

	const isMissionControl = (controllerId: Principal): boolean =>
		nonNullish($missionControlIdDerived) &&
		$missionControlIdDerived.toText() === controllerId.toText();
	const isDev = (controllerId: Principal): boolean =>
		nonNullish($authStore.identity) &&
		$authStore.identity.getPrincipal().toText() === controllerId.toText();
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
				{@const dev = isDev(controllerId)}
				{@const mic = isMissionControl(controllerId)}

				<tr>
					<td class="actions">
						{#if !dev && !mic}
							<ButtonTableAction
								ariaLabel={$i18n.controllers.delete}
								icon="delete"
								onaction={() => {
									selectedController = [controllerId, controller];
									visibleDelete = true;
								}}
							/>
						{:else}
							<ButtonTableAction
								ariaLabel={$i18n.controllers.info}
								icon="info"
								onaction={() => (visibleInfo = true)}
							/>
						{/if}
					</td>

					<td>
						<Identifier identifier={controllerId.toText()} shorten={false} small={false} />
					</td>

					<td class="profile"
						>{#if mic}
							{$i18n.mission_control.title}
						{:else if dev}
							{$i18n.preferences.dev_id}
						{:else}
							{metadataProfile(nonNullish(controller) ? controller.metadata : [])}
						{/if}
					</td>

					<td class="scope">
						{#if nonNullish(controller)}
							{#if 'Write' in controller.scope}
								{$i18n.controllers.write}
							{:else if 'Admin' in controller.scope}
								{$i18n.controllers.admin}
							{:else if 'Submit' in controller.scope}
								{$i18n.controllers.submit}
							{/if}
						{/if}
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<ControllerAdd {add} {load} {segment} />

<ControllerDelete {load} {remove} bind:selectedController bind:visible={visibleDelete} />

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
