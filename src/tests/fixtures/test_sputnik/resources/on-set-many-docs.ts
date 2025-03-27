import { defineHook, type OnSetManyDocs } from '@junobuild/functions';

/* eslint-disable no-console */

export const onSetManyDocs = defineHook<OnSetManyDocs>({
    collections: ['test-onsetmanydocs'],
    run: async (context) => {
        console.log('onSetManyDocs called');

        switch (context.data) {
            case 'test-delete-assert':
                onAssertDeleteDocDemo(context);
                break;
        }
    }
});

/* eslint-enable */