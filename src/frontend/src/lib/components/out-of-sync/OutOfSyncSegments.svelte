<script lang="ts">
    import type {Snippet} from "svelte";

    interface Props {
        label: Snippet
    }

    let {label}: Props = $props();

</script>

<div class="card-container with-title from">
    <span class="title">{@render label()}</span>

    <div class="content">
    </div>
</div>