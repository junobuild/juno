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
	testSdkDeleteDocsStore,
	testSdkDeleteDocStore,
	testSdkDeleteFilteredDocsStore,
	testSdkGetDocStore,
	testSdkListDocsStore,
	testSdkSetDocStore
} from './sdk/db';
import {testMathRandom} from "./apis/node/math";

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
	'test-mathrandom',
	'test-deletedoc',
	'test-getdoc',
	'test-sdk-controllers',
	'test-listdocs',
	'test-countcollectiondocs',
	'test-countdocs',
	'test-deletedocs',
	'test-deletefiltereddocs'
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
			'test-mathrandom': testMathRandom,
			'test-deletedoc': testSdkDeleteDocStore,
			'test-getdoc': testSdkGetDocStore,
			'test-listdocs': testSdkListDocsStore,
			'test-sdk-controllers': testSdkControllers,
			'test-countcollectiondocs': testSdkCountCollectionDocsStore,
			'test-countdocs': testSdkCountDocsStore,
			'test-deletedocs': testSdkDeleteDocsStore,
			'test-deletefiltereddocs': testSdkDeleteFilteredDocsStore
		};

		await fn[context.data.collection as OnSetDocCollection]?.(context);
	}
});
