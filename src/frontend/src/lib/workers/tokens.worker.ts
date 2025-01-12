import type {PostMessage, PostMessageDataRequest} from "$lib/types/post-message";
import {SYNC_MONITORING_TIMER_INTERVAL, SYNC_TOKENS_TIMER_INTERVAL} from "$lib/constants/constants";
import type {Identity} from "@dfinity/agent";

export const onTokensMessage = async ({
                                              data: dataMsg
                                          }: MessageEvent<PostMessage<PostMessageDataRequest>>) => {
    const {msg, data} = dataMsg;

    switch (msg) {
        case 'stopTokensTimer':
            stopTokensTimer();
            return;
        case 'startTokensTimer':
            await startTokensTimer();
            return;
        case 'restartTokensTimer':
            stopTokensTimer();
            await startTokensTimer();
            return;
    }
};

let timer: NodeJS.Timeout | undefined = undefined;

const startTokensTimer = async () => {
    const sync = async () =>
        await syncTokens({
            identity,
            segments: segments ?? [],
            missionControlId,
            withTokensHistory: withTokensHistory ?? false
        });

    // We sync the cycles now but also schedule the update afterwards
    await sync();

    timer = setInterval(sync, SYNC_TOKENS_TIMER_INTERVAL);
}

const stopTokensTimer = () => {
    if (!timer) {
        return;
    }

    clearInterval(timer);
    timer = undefined;
};

let syncing = false;

const syncMonitoring = async () => {
    // We avoid to relaunch a sync while previous sync is not finished
    if (syncing) {
        return;
    }


}