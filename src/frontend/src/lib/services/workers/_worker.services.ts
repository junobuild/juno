export abstract class AppWorker {
	protected readonly _worker: Worker;

	protected constructor(worker: Worker) {
		this._worker = worker;
	}

	static async getInstance(): Promise<Worker> {
		const Workers = await import('$lib/workers/workers?worker');
		return new Workers.default();
	}

	terminate = () => {
		this._worker.terminate();
	};
}
