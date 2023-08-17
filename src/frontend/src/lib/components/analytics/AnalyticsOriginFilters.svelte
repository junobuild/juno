<script lang="ts">
	import { i18n } from '$lib/stores/i18n.store';
	import type { Principal } from '@dfinity/principal';
	import AnalyticsOriginAdd from '$lib/components/analytics/AnalyticsOriginAdd.svelte';

	export let orbiterId: Principal;
</script>

<div class="table-container">
	<table>
		<thead>
			<tr>
				<th class="tools" />
				<th class="origin"> {$i18n.origins.title} </th>
			</tr>
		</thead>
		<tbody>
			<tr>
				<td class="actions" />
				<td>
					{$i18n.origins.empty}
				</td>
			</tr>
		</tbody>
	</table>
</div>

<AnalyticsOriginAdd {orbiterId} />

<style lang="scss">
	@use '../../styles/mixins/media';

	.tools {
		width: 48px;
	}
</style>
