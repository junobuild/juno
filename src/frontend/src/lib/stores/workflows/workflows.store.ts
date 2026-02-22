import type { LedgerIdText } from '$lib/schemas/wallet.schema';
import type { SatelliteIdText } from '$lib/types/satellite';
import type { Option } from '$lib/types/utils';
import type { CertifiedWorkflowsKeyValue, WorkflowProvider } from '$lib/types/workflow';
import { type Readable, writable } from 'svelte/store';

type CertifiedWorkflowsStoreData = Option<
	Record<SatelliteIdText, Record<WorkflowProvider, CertifiedWorkflowsKeyValue>>
>;

interface CertifiedWorkflowsStore extends Readable<CertifiedWorkflowsStoreData> {
	prepend: (params: {
		satelliteId: SatelliteIdText;
		workflows: CertifiedWorkflowsKeyValue;
	}) => void;
	append: (params: {
		satelliteId: SatelliteIdText;
		ledgerId: LedgerIdText;
		workflows: CertifiedWorkflowsKeyValue;
	}) => void;
	reset: () => void;
}

const initCertifiedWorkflowsStore = (): CertifiedWorkflowsStore => {
	const { subscribe, update, set } = writable<CertifiedWorkflowsStoreData>(undefined);

	return {
		prepend: ({ satelliteId, workflows }) =>
			update((state) => ({
				...(state ?? {}),
				[satelliteId]: {
					...(state?.[satelliteId] ?? {}),
					GitHub: [...workflows],
					...((state ?? {})[satelliteId]?.GitHub ?? []).filter(
						({ data: [key] }) => !workflows.some(({ data: [wKey] }) => wKey === key)
					)
				}
			})),

		append: ({ satelliteId, workflows }) =>
			update((state) => ({
				...(state ?? {}),
				[satelliteId]: {
					...(state?.[satelliteId] ?? {}),
					GitHub: [...((state ?? {})[satelliteId]?.GitHub ?? []), ...workflows]
				}
			})),

		reset: () => {
			set(null);
		},

		subscribe
	};
};

export const workflowsCertifiedStore = initCertifiedWorkflowsStore();
