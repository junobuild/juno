import {
	defineHook,
	type OnSetDoc,
	type OnSetDocContext,
	type RunFunction
} from '@junobuild/functions';
import { testIcCdkCall } from './ic-cdk-call';
import { testIcCdkId } from './ic-cdk-id';
import { testSdkDeleteDocStore, testSdkSetDocStore } from './sdk';
import { testTextEncoding } from './text-encoding';

/* eslint-disable require-await, no-console */

const testSetDoc = async (context: OnSetDocContext) => {
	console.log('onSetDoc:', context.data.key);
};

/* eslint-enable */

const collections = [
	'test-onsetdoc',
	'test-ic-cdk-id',
	'test-ic-cdk-call',
	'test-update',
	'test-textencoding',
	'test-deletedoc'
] as const;

type OnSetDocCollection = (typeof collections)[number];

export const onSetDoc = defineHook<OnSetDoc>({
	collections,
	run: async (context) => {
		const fn: Record<OnSetDocCollection, RunFunction<OnSetDocContext>> = {
			'test-onsetdoc': testSetDoc,
			'test-ic-cdk-id': testIcCdkId,
			'test-update': testSdkSetDocStore,
			'test-ic-cdk-call': testIcCdkCall,
			'test-textencoding': testTextEncoding,
			'test-deletedoc': testSdkDeleteDocStore
		};

		await fn[context.data.collection as OnSetDocCollection]?.(context);
	}
});
