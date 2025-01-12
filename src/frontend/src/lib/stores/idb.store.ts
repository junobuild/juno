import { createStore } from 'idb-keyval';

// Loaded and set in web workers
export const cyclesIdbStore = createStore('juno-db', 'juno-cycles-store');
export const monitoringIdbStore = createStore('juno-monitoring', 'juno-monitoring-store');

// Loaded and set on the UI side
export const snapshotsIdbStore = createStore('juno-snapshot', 'juno-snapshot-store');
export const subnetsIdbStore = createStore('juno-subnet', 'juno-subnet-store');
