<script lang="ts">
    import NotificationButton from "$lib/components/notifications/NotificationButton.svelte";
    import {i18n} from "$lib/stores/app/i18n.store";
    import IconSyncProblem from "$lib/components/icons/IconSyncProblem.svelte";

    interface Props {
        close: () => void;
    }

    let {close}: Props = $props();

    const onclick = () => {
        close();
    }
</script>

<NotificationButton {onclick}>
    {#snippet icon()}
        <IconSyncProblem size="32px" />
    {/snippet}

    {$i18n.notifications.out_of_sync}
</NotificationButton>