import { type Identity, MANAGEMENT_CANISTER_ID } from '@dfinity/agent';
import { IDL } from '@dfinity/candid';
import { Principal } from '@dfinity/principal';
import { arrayBufferToUint8Array, hexStringToUint8Array, toNullable } from '@dfinity/utils';
import type { ActorInterface, CanisterFixture, PocketIc } from '@hadronous/pic';
import { uint8ArraySha256 } from '@junobuild/admin';
import { readFile } from 'node:fs/promises';

const INSTALL_MAX_CHUNK_SIZE = 1_000_000;

// Clear chunk store did

const canister_id = IDL.Principal;
const clear_chunk_store_args = IDL.Record({ canister_id: canister_id });

export type canister_id = Principal;
export interface clear_chunk_store_args {
	canister_id: canister_id;
}

// Upload chunk did

const upload_chunk_args = IDL.Record({
	chunk: IDL.Vec(IDL.Nat8),
	canister_id: IDL.Principal
});
const chunk_hash = IDL.Record({ hash: IDL.Vec(IDL.Nat8) });
const upload_chunk_result = chunk_hash;

export interface upload_chunk_args {
	chunk: Uint8Array | number[];
	canister_id: Principal;
}
export type upload_chunk_result = chunk_hash;
export interface chunk_hash {
	hash: Uint8Array | number[];
}

// Install chunked code did

const canister_install_mode = IDL.Variant({
	reinstall: IDL.Null,
	upgrade: IDL.Opt(
		IDL.Record({
			wasm_memory_persistence: IDL.Opt(IDL.Variant({ keep: IDL.Null, replace: IDL.Null })),
			skip_pre_upgrade: IDL.Opt(IDL.Bool)
		})
	),
	install: IDL.Null
});

const install_chunked_code_args = IDL.Record({
	arg: IDL.Vec(IDL.Nat8),
	wasm_module_hash: IDL.Vec(IDL.Nat8),
	mode: canister_install_mode,
	chunk_hashes_list: IDL.Vec(chunk_hash),
	target_canister: canister_id,
	store_canister: IDL.Opt(canister_id),
	sender_canister_version: IDL.Opt(IDL.Nat64)
});

export type canister_install_mode =
	| { reinstall: null }
	| {
			upgrade:
				| []
				| [
						{
							wasm_memory_persistence: [] | [{ keep: null } | { replace: null }];
							skip_pre_upgrade: [] | [boolean];
						}
				  ];
	  }
	| { install: null };

interface install_chunked_code_args {
	arg: Uint8Array | number[];
	wasm_module_hash: Uint8Array | number[];
	mode: canister_install_mode;
	chunk_hashes_list: Array<chunk_hash>;
	target_canister: canister_id;
	store_canister: [] | [canister_id];
	sender_canister_version: [] | [bigint];
}

// Program

interface SetupParams {
	pic: PocketIc;
	sender: Identity;
}

interface SetupChunkedCanisterParams extends SetupParams {
	wasmPath: string;
	arg: ArrayBuffer;
	idlFactory: IDL.InterfaceFactory;
}

export const setupChunkedCanister = async <T extends ActorInterface<T> = ActorInterface>({
	pic,
	sender,
	wasmPath,
	arg,
	idlFactory
}: SetupChunkedCanisterParams): Promise<CanisterFixture<T>> => {
	const canisterId = await pic.createCanister({
		sender: sender.getPrincipal()
	});

	await clearChunkStoreApi({ canisterId, pic, sender });

	const wasm = await readFile(wasmPath);

	const uploadChunks = await wasmToChunks({ wasm: new Uint8Array(wasm) });

	// Upload chunks to the IC in batch - i.e. 12 chunks uploaded at a time.
	let chunkIds: UploadChunkResult[] = [];
	for await (const results of batchUploadChunks({
		uploadChunks,
		canisterId,
		pic,
		sender
	})) {
		chunkIds = [...chunkIds, ...results];
	}

	// Install the chunked code.
	// ⚠️ The order of the chunks is really important! ⚠️
	await installChunkedCodeApi({
		pic,
		sender,
		canisterId,
		arg,
		chunkHashesList: chunkIds
			.sort(({ orderId: orderIdA }, { orderId: orderIdB }) => orderIdA - orderIdB)
			.map(({ chunkHash }) => chunkHash),
		wasmModuleHash: await uint8ArraySha256(wasm)
	});

	const actor = pic.createActor<T>(idlFactory, canisterId);

	return { canisterId, actor };
};

const clearChunkStoreApi = async ({
	canisterId,
	pic,
	sender
}: SetupParams & { canisterId: Principal }) => {
	const payload: clear_chunk_store_args = {
		canister_id: canisterId
	};

	const arg = IDL.encode([clear_chunk_store_args], [payload]);

	await pic.updateCall({
		method: 'clear_chunk_store',
		arg,
		canisterId: Principal.fromText(MANAGEMENT_CANISTER_ID),
		sender: sender.getPrincipal()
	});
};

interface UploadChunkOrderId {
	orderId: number;
}

interface UploadChunkParams extends UploadChunkOrderId {
	chunk: Blob;
}

interface UploadChunkResult extends UploadChunkOrderId {
	chunkHash: chunk_hash;
}

const wasmToChunks = async ({
	wasm
}: {
	wasm: Uint8Array<ArrayBuffer>;
}): Promise<UploadChunkParams[]> => {
	const blob = new Blob([wasm]);

	const uploadChunks: UploadChunkParams[] = [];

	const chunkSize = INSTALL_MAX_CHUNK_SIZE;

	// Split data into chunks
	let orderId = 0;
	for (let start = 0; start < blob.size; start += chunkSize) {
		const chunk = blob.slice(start, start + chunkSize);
		uploadChunks.push({
			chunk,
			orderId
		});

		orderId++;
	}

	return uploadChunks;
};

async function* batchUploadChunks({
	uploadChunks,
	limit = 12,
	...rest
}: SetupParams & { canisterId: Principal } & {
	uploadChunks: UploadChunkParams[];
	limit?: number;
}): AsyncGenerator<UploadChunkResult[], void> {
	for (let i = 0; i < uploadChunks.length; i = i + limit) {
		const batch = uploadChunks.slice(i, i + limit);
		const result = await Promise.all(
			batch.map((uploadChunkParams) =>
				uploadChunk({
					uploadChunk: uploadChunkParams,
					...rest
				})
			)
		);
		yield result;
	}
}

const uploadChunk = async ({
	uploadChunk: { chunk, ...restChunk },
	...rest
}: {
	uploadChunk: UploadChunkParams;
} & SetupParams & {
		canisterId: Principal;
	}): Promise<UploadChunkResult> => {
	const chunkHash = await uploadChunkApi({
		chunk,
		...rest
	});

	return {
		chunkHash,
		...restChunk
	};
};

const uploadChunkApi = async ({
	canisterId,
	chunk,
	pic,
	sender
}: SetupParams & { canisterId: Principal } & Pick<UploadChunkParams, 'chunk'>) => {
	const payload: upload_chunk_args = {
		canister_id: canisterId,
		chunk: new Uint8Array(await chunk.arrayBuffer())
	};

	const arg = IDL.encode([upload_chunk_args], [payload]);

	const response = await pic.updateCall({
		method: 'upload_chunk',
		arg,
		canisterId: Principal.fromText(MANAGEMENT_CANISTER_ID),
		sender: sender.getPrincipal()
	});

	const result = IDL.decode(toNullable(upload_chunk_result), response as ArrayBuffer);

	const [hash] = result as unknown as [upload_chunk_result];

	return hash;
};

const installChunkedCodeApi = async ({
	arg: initArg,
	canisterId,
	chunkHashesList,
	wasmModuleHash,
	sender,
	pic
}: Omit<SetupChunkedCanisterParams, 'wasmPath' | 'idlFactory'> & {
	canisterId: Principal;
	wasmModuleHash: string;
	chunkHashesList: Array<chunk_hash>;
}) => {
	const payload: install_chunked_code_args = {
		arg: arrayBufferToUint8Array(initArg),
		wasm_module_hash: hexStringToUint8Array(wasmModuleHash),
		mode: { install: null },
		chunk_hashes_list: chunkHashesList,
		sender_canister_version: toNullable(),
		store_canister: toNullable(),
		target_canister: canisterId
	};

	const arg = IDL.encode([install_chunked_code_args], [payload]);

	const subnetId = await pic.getCanisterSubnetId(canisterId);

	await pic.updateCall({
		method: 'install_chunked_code',
		arg,
		canisterId: Principal.fromText(MANAGEMENT_CANISTER_ID),
		sender: sender.getPrincipal(),
		targetSubnetId: subnetId ?? undefined
	});
};
