<script lang="ts">
    import type {MonitoringHistory} from "$lib/types/monitoring";

    interface Props {
        history: MonitoringHistory | undefined;
    }

    let {history}: Props = $props();
</script>