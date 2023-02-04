<script lang="ts">
	import IconCheckbox from '$lib/components/icons/IconCheckbox.svelte';
	import IconIC from '$lib/components/icons/IconIC.svelte';
	import ExternalLink from '$lib/components/ui/ExternalLink.svelte';
</script>

<div class="table-container">
	<table>
		<thead>
			<tr>
				<th>Provider</th>
				<th>Status</th>
			</tr>
		</thead>

		<tbody>
			<tr>
				<td
					><ExternalLink href="https://identity.ic0.app/"><IconIC /> Internet Identity</ExternalLink
					></td
				>
				<td><IconCheckbox /> Enabled</td>
			</tr>
		</tbody>
	</table>
</div>
