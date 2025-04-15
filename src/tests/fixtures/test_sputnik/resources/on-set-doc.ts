import {
	defineHook,
	type OnSetDoc,
	type OnSetDocContext,
	type RunFunction
} from '@junobuild/functions';
import { testIcCdkCall } from './apis/ic-cdk/ic-cdk-call';
import { testIcCdkId } from './apis/ic-cdk/ic-cdk-id';
import { testTextEncoding } from './apis/node/text-encoding';
import { testSdkControllers } from './sdk/controllers';
import {
	testSdkCountCollectionDocsStore,
	testSdkCountDocsStore,
	testSdkDeleteDocStore,
	testSdkGetDocStore,
	testSdkListDocsStore,
	testSdkSetDocStore
} from './sdk/db';

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
	'test-deletedoc',
	'test-getdoc',
	'test-sdk-controllers',
	'test-listdocs',
	'test-countcollectiondocs',
	'test-countdocs'
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
			'test-deletedoc': testSdkDeleteDocStore,
			'test-getdoc': testSdkGetDocStore,
			'test-listdocs': testSdkListDocsStore,
			'test-sdk-controllers': testSdkControllers,
			'test-countcollectiondocs': testSdkCountCollectionDocsStore,
			'test-countdocs': testSdkCountDocsStore
		};

		await fn[context.data.collection as OnSetDocCollection]?.(context);
	}
});
