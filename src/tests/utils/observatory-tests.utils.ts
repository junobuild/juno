import type { _SERVICE as ObservatoryActor_0_0_9 } from '$declarations/deprecated/observatory-0-0-9.did';
import type {
	_SERVICE as ObservatoryActor,
	SegmentKind
} from '$declarations/observatory/observatory.did';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import type { Principal } from '@dfinity/principal';
import { assertNonNullish, nonNullish } from '@dfinity/utils';
import type { PocketIc } from '@hadronous/pic';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { mockMissionControlId } from '../../frontend/tests/mocks/modules.mock';
import { toBodyJson } from './orbiter-test.utils';
import { tick } from './pic-tests.utils';

export const mockObservatoryProxyBearerKey = 'test-key';

export const DEPOSITED_CYCLES_TEMPLATE_TEXT = readFileSync(
	join(process.cwd(), 'src/observatory/resources/deposited-cycles.txt'),
	'utf-8'
);

export const DEPOSITED_CYCLES_TEMPLATE_HTML = readFileSync(
	join(process.cwd(), 'src/observatory/resources/deposited-cycles.html'),
	'utf-8'
);

export const FAILED_DEPOSIT_CYCLES_TEMPLATE_TEXT = readFileSync(
	join(process.cwd(), 'src/observatory/resources/failed-deposit-cycles.txt'),
	'utf-8'
);

export const FAILED_DEPOSIT_CYCLES_TEMPLATE_HTML = readFileSync(
	join(process.cwd(), 'src/observatory/resources/failed-deposit-cycles.html'),
	'utf-8'
);

export const testDepositedCyclesNotification = async ({
	kind,
	metadataName,
	moduleName,
	actor,
	...rest
}: {
	kind: SegmentKind;
	url: string;
	moduleName: 'Mission Control' | 'Satellite' | 'Orbiter';
	metadataName?: string;
	actor: ObservatoryActor | ObservatoryActor_0_0_9;
	pic: PocketIc;
}) => {
	const { ping } = actor;

	await ping({
		kind: {
			DepositedCyclesEmail: {
				to: 'test@test.com',
				deposited_cycles: {
					amount: 123456789n,
					timestamp: 1747036399590000000n
				}
			}
		},
		segment: {
			id: mockMissionControlId,
			metadata: nonNullish(metadataName) ? [[['name', metadataName]]] : [],
			kind
		},
		user: Ed25519KeyIdentity.generate().getPrincipal()
	});

	await assertNotificationHttpsOutcalls({
		templateText: DEPOSITED_CYCLES_TEMPLATE_TEXT,
		templateHtml: DEPOSITED_CYCLES_TEMPLATE_HTML,
		templateTitle: `🚀 {{cycles}} T Cycles Deposited on Your ${moduleName}`,
		moduleName,
		metadataName,
		expectedIdempotencyKeySegmentId: mockMissionControlId,
		expectedCycles: '0.00012346',
		...rest
	});
};

export const testFailedDepositCyclesNotification = async ({
	kind,
	metadataName,
	moduleName,
	actor,
	...rest
}: {
	kind: SegmentKind;
	url: string;
	moduleName: 'Mission Control' | 'Satellite' | 'Orbiter';
	metadataName?: string;
	actor: ObservatoryActor;
	pic: PocketIc;
}) => {
	const { ping } = actor;

	await ping({
		kind: {
			FailedCyclesDepositEmail: {
				to: 'test@test.com',
				funding_failure: {
					error_code: { DepositFailed: null },
					timestamp: 1747036399590000000n
				}
			}
		},
		segment: {
			id: mockMissionControlId,
			metadata: nonNullish(metadataName) ? [[['name', metadataName]]] : [],
			kind
		},
		user: Ed25519KeyIdentity.generate().getPrincipal()
	});

	await assertNotificationHttpsOutcalls({
		templateText: FAILED_DEPOSIT_CYCLES_TEMPLATE_TEXT,
		templateHtml: FAILED_DEPOSIT_CYCLES_TEMPLATE_HTML,
		templateTitle: `❗️Cycles Deposit Failed on Your ${moduleName}`,
		moduleName,
		metadataName,
		expectedIdempotencyKeySegmentId: mockMissionControlId,
		...rest
	});
};

export const assertNotificationHttpsOutcalls = async ({
	url: expectedUrl,
	moduleName,
	metadataName,
	pic,
	templateHtml,
	templateText,
	templateTitle,
	expectedCycles,
	expectedIdempotencyKeySegmentId,
	expectedTimestamp = '2025-05-12T07:53:19+00:00'
}: {
	url: string;
	moduleName: 'Mission Control' | 'Satellite' | 'Orbiter';
	metadataName?: string;
	pic: PocketIc;
	templateHtml: string;
	templateText: string;
	templateTitle: string;
	expectedCycles?: string;
	expectedIdempotencyKeySegmentId: Principal;
	expectedTimestamp?: string;
}) => {
	await tick(pic);

	const [pendingHttpOutCall] = await pic.getPendingHttpsOutcalls();

	assertNonNullish(pendingHttpOutCall);

	const { requestId, subnetId, url, headers: headersArray, body } = pendingHttpOutCall;

	expect(url).toEqual(
		'https://europe-west6-juno-observatory.cloudfunctions.net/observatory/notifications/email'
	);

	const headers = headersArray.reduce<Record<string, string>>(
		(acc, [key, value]) => ({ ...acc, [key]: value }),
		{}
	);

	expect(headers['Content-Type']).toEqual('application/json');
	expect(headers['authorization']).toEqual(`Bearer ${mockObservatoryProxyBearerKey}`);

	// e.g. rdmx6-jaaaa-aaaaa-aaadq-cai___1620328630000000105___747495116
	const idempotencyKey = headers['idempotency-key'].split('___');

	expect(idempotencyKey[0]).toEqual(expectedIdempotencyKeySegmentId.toText());
	expect(BigInt(idempotencyKey[1])).toBeGreaterThan(0n);
	expect(Number(idempotencyKey[1])).toBeGreaterThan(0);

	const decoder = new TextDecoder();
	const { from, subject, text, html } = JSON.parse(decoder.decode(body));

	expect(from).toEqual('Juno <notify@notifications.juno.build>');
	expect(subject).toEqual(templateTitle.replaceAll('{{cycles}}', expectedCycles ?? ''));

	const parseTemplate = (template: string): string =>
		template
			.replaceAll('{{cycles}}', expectedCycles ?? '')
			.replaceAll('{{module}}', moduleName)
			.replaceAll(' ({{name}})', nonNullish(metadataName) ? ` (${metadataName})` : '')
			.replaceAll(
				' (<!-- -->{{name}}<!-- -->)',
				nonNullish(metadataName) ? ` (<!-- -->${metadataName}<!-- -->)` : ''
			)
			.replaceAll('{{timestamp}}', expectedTimestamp)
			.replaceAll('{{url}}', expectedUrl);

	expect(text).toEqual(parseTemplate(templateText));
	expect(html).toEqual(parseTemplate(templateHtml));

	// Finalize
	await pic.mockPendingHttpsOutcall({
		requestId,
		subnetId,
		response: {
			type: 'success',
			body: toBodyJson({}),
			statusCode: 200,
			headers: []
		}
	});

	await tick(pic);
};
