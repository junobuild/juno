import { queryAndUpdate } from '$lib/api/call/query.api';
import { AnonymousIdentity } from '@dfinity/agent';
import { tick } from 'svelte';

describe('query.api', () => {
	const identity = new AnonymousIdentity();

	// we mock console.error just to avoid unnecessary logs while running the tests
	vi.spyOn(console, 'error').mockImplementation(() => undefined);

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should request twice', async () => {
		const request = vi.fn().mockImplementation(() => Promise.resolve({ certified: true }));
		const onLoad = vi.fn();
		const onError = vi.fn();

		await queryAndUpdate<number, unknown>({
			request,
			onLoad,
			onError,
			identity
		});

		expect(request).toHaveBeenCalledTimes(2);
		expect(onLoad).toHaveBeenCalledTimes(2);
		expect(onError).not.toHaveBeenCalled();
	});

	it('should work w/o await call', async () => {
		const request = vi.fn().mockImplementation(() => Promise.resolve({ certified: true }));
		const onLoad = vi.fn();
		const onError = vi.fn();

		await queryAndUpdate<number, unknown>({
			request,
			onLoad,
			onError,
			identity
		});

		await tick();

		expect(request).toHaveBeenCalledTimes(2);
		expect(onLoad).toHaveBeenCalledTimes(2);
		expect(onError).not.toHaveBeenCalled();
	});

	it('should support "query_and_update" strategy', async () => {
		const requestCertified: boolean[] = [];
		const request = vi.fn().mockImplementation(({ certified }: { certified: boolean }) => {
			requestCertified.push(certified);
			return Promise.resolve();
		});
		const onLoad = vi.fn();

		await queryAndUpdate<number, unknown>({
			request,
			onLoad,
			identity
		});

		expect(requestCertified.sort()).toEqual([false, true]);
	});

	it('should support "query" strategy', async () => {
		const requestCertified: boolean[] = [];
		const request = vi.fn().mockImplementation(({ certified }: { certified: boolean }) => {
			requestCertified.push(certified);
			return Promise.resolve();
		});
		const onLoad = vi.fn();

		await queryAndUpdate<number, unknown>({
			request,
			onLoad,
			strategy: 'query',
			identity
		});

		expect(requestCertified.sort()).toEqual([false]);
	});

	it('should support "update" strategy', async () => {
		const requestCertified: boolean[] = [];
		const request = vi.fn().mockImplementation(({ certified }: { certified: boolean }) => {
			requestCertified.push(certified);
			return Promise.resolve();
		});
		const onLoad = vi.fn();

		await queryAndUpdate<number, unknown>({
			request,
			onLoad,
			strategy: 'update',
			identity
		});

		expect(requestCertified.sort()).toEqual([true]);
	});

	it('should catch errors', async () => {
		const request = vi.fn().mockImplementation(() => Promise.reject('test'));
		const onLoad = vi.fn();
		const onError = vi.fn();

		await queryAndUpdate<number, unknown>({
			request,
			onLoad,
			onError,
			identity
		});

		expect(onLoad).not.toHaveBeenCalled();
		expect(onError).toHaveBeenCalledTimes(2);
		expect(onError).toHaveBeenCalledWith({
			certified: false,
			error: 'test',
			identity
		});
	});

	it('should catch certified errors', async () => {
		const request = vi.fn().mockImplementation(() => Promise.reject('test'));
		const onLoad = vi.fn();
		const onError = vi.fn();
		const onCertifiedError = vi.fn();

		await queryAndUpdate<number, unknown>({
			request,
			onLoad,
			onError,
			onCertifiedError,
			identity
		});

		expect(onLoad).not.toHaveBeenCalled();
		expect(onError).toHaveBeenCalledTimes(2);
		expect(onCertifiedError).toHaveBeenCalledTimes(1);
		expect(onError).toHaveBeenCalledWith({
			certified: false,
			error: 'test',
			identity
		});
		expect(onError).toHaveBeenCalledWith({
			certified: true,
			error: 'test',
			identity
		});
		expect(onCertifiedError).toHaveBeenCalledWith({
			error: 'test',
			identity
		});
	});

	it('should not call QUERY onLoad when UPDATE comes first', async () => {
		let queryDone = false;
		const request = vi.fn().mockImplementation(({ certified }: { certified: boolean }) =>
			certified
				? Promise.resolve()
				: new Promise((resolve) =>
						setTimeout(() => {
							queryDone = true;
							resolve({});
						}, 1)
					)
		);
		const onLoad = vi.fn();
		const onError = vi.fn();

		await queryAndUpdate<number, unknown>({
			request,
			onLoad,
			onError,
			identity
		});
		await new Promise((resolve) => setTimeout(resolve, 10));

		expect(queryDone).toBeTruthy();
		expect(request).toHaveBeenCalledTimes(2);
		expect(onLoad).toHaveBeenCalledTimes(1);
		expect(onError).not.toHaveBeenCalled();
	});

	it('should resolve promise when the first response is done', async () => {
		let updateDone = false;
		let queryDone = false;
		const request = vi.fn().mockImplementation(({ certified }: { certified: boolean }) =>
			certified
				? new Promise((resolve) => {
						setTimeout(() => {
							updateDone = true;
							resolve({});
						}, 1);
					})
				: new Promise((resolve) => {
						setTimeout(() => {
							queryDone = true;
							resolve({});
						}, 100);
					})
		);
		const onLoad = vi.fn();

		expect(updateDone).toBeFalsy();
		expect(queryDone).toBeFalsy();

		await queryAndUpdate<number, unknown>({
			request,
			onLoad,
			identity
		});

		expect(updateDone).toBeTruthy();
		expect(queryDone).toBeFalsy();
	});

	it('should not resolve promise when the first response is done', async () => {
		let updateDone = false;
		let queryDone = false;
		const request = vi.fn().mockImplementation(({ certified }: { certified: boolean }) =>
			certified
				? new Promise((resolve) => {
						setTimeout(() => {
							updateDone = true;
							resolve({});
						}, 1);
					})
				: new Promise((resolve) => {
						setTimeout(() => {
							queryDone = true;
							resolve({});
						}, 100);
					})
		);
		const onLoad = vi.fn();

		expect(updateDone).toBeFalsy();
		expect(queryDone).toBeFalsy();

		await queryAndUpdate<number, unknown>({
			request,
			onLoad,
			identity,
			resolution: 'all_settled'
		});

		expect(updateDone).toBeTruthy();
		expect(queryDone).toBeTruthy();
	});
});
