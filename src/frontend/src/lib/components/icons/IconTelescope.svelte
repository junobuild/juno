<!-- source: Font Awesome v5.15.4 - David Pro License -->
<script lang="ts">
	interface Props {
		size?: number;
	}

	let { size = 24 }: Props = $props();

	let width = $derived(`${(size * 576) / 512}px`);
</script>

<svg
	xmlns="http://www.w3.org/2000/svg"
	viewBox="0 0 640 512"
	{width}
	height={size}
	fill="currentColor"
	><!-- !Font Awesome Pro 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2025 Fonticons, Inc. --><path
		d="M637.6 197.1 564.1 19.8A32 32 0 0 0 522.3 2.4L413.7 47.4c-15.2 6.3-22.5 23-18 38.5L75.1 241.4c-8.8 4.3-13.1 13.6-9.9 21.4l8.7 21.1L9.9 310.4a16 16 0 0 0 -8.7 20.9l20.1 48.4a16 16 0 0 0 20.9 8.7l64.1-26.6 8.7 21.1c4.1 9.8 15.4 10.4 22.1 8.1l133.9-46.5c1.3 1.5 2.9 2.8 4.3 4.2L224.4 501.5a8 8 0 0 0 7.6 10.5h16.8a8 8 0 0 0 7.6-5.5l47-141c12.4 3.4 21.7 3.1 33.1 0l47 141a8 8 0 0 0 7.6 5.5H408a8 8 0 0 0 7.6-10.5l-50.7-152a63.9 63.9 0 0 0 18.9-43.9l90.5-31.4c6.7 8.5 21.1 16.5 37.3 9.8l108.6-45A32 32 0 0 0 637.6 197.1zM44.7 352.7 36.9 333.9l49.3-20.4 7.8 18.9zm275.3-16.7a32 32 0 1 1 32-32A32 32 0 0 1 320 336zm56.3-61.8a63.7 63.7 0 0 0 -119.1 41.3L138.8 356.7 100.6 264.6 407.4 115.8l53.5 129.1zm123.1-19.9L425.9 77l108.6-45 73.5 177.4z"
	/></svg
>
