import type { PostMessageDataRequest, PostMessageRequest } from '$lib/types/post-message';

export const onRegistryMessage = async ({ data: dataMsg }: MessageEvent<PostMessageRequest>) => {
	const { msg, data } = dataMsg;

	switch (msg) {
		case 'loadRegistry':
			await startCyclesTimer({ data });
			return;
	}
};

const startCyclesTimer = async ({ data: { segments } }: { data: PostMessageDataRequest }) => {

}