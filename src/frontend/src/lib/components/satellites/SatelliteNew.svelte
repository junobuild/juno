<script lang="ts">
	import Article from '$lib/components/ui/Article.svelte';
	import { emit } from '$lib/utils/events.utils';
	import IconNew from '$lib/components/icons/IconNew.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import { missionControlStore } from '$lib/stores/mission-control.store';
	import { isNullish, nonNullish } from '$lib/utils/utils';
	import { busy } from '$lib/stores/busy.store';
	import { authStore } from '$lib/stores/auth.store';
	import { getCreateSatelliteFeeBalance } from '$lib/services/wizard.services';

	const createSatellite = async () => {
		busy.start();

		const { result, error } = await getCreateSatelliteFeeBalance({
			identity: $authStore.identity,
			missionControlId: $missionControlStore
		});

		busy.stop();

		if (nonNullish(error) || isNullish(result)) {
			return;
		}

		emit({ message: 'junoModal', detail: { type: 'create_satellite', detail: result } });
	};
</script>

<Article on:click={createSatellite}>
	<div class="new">
		<IconNew size="48px" />

		<p>{$i18n.satellites.launch}</p>
	</div>
</Article>

<style lang="scss">
	@use '../../styles/mixins/fonts';

	.new {
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;

		gap: var(--padding-4x);

		height: 100%;

		color: var(--color-primary);
	}

	p {
		@include fonts.bold(true);

		color: var(--text-color);
		max-width: 150px;
		text-align: center;

		margin: 0;
	}
</style>
