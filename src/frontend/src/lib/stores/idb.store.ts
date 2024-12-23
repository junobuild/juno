import { createStore } from 'idb-keyval';

// Loaded and set in web workers
export const cyclesIdbStore = createStore('juno-db', 'juno-cycles-store');
export const statusesIdbStore = createStore('juno-statuses', 'juno-statuses-store');
export const monitoringHistoryIdbStore = createStore(
	'juno-monitoring-history',
	'juno-monitoring-history-store'
);

// Loaded and set on the UI side
export const snapshotsIdbStore = createStore('juno-snapshot', 'juno-snapshot-store');
export const subnetsIdbStore = createStore('juno-subnet', 'juno-subnet-store');
