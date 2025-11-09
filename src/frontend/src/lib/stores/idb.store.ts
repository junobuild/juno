import { createStore } from 'idb-keyval';

// Loaded and set in web workers
export const cyclesIdbStore = createStore('juno-db', 'juno-cycles-store');
export const monitoringIdbStore = createStore('juno-monitoring', 'juno-monitoring-store');
export const exchangeIdbStore = createStore('juno-exchange', 'juno-exchange-store');
export const walletIdbStore = createStore('juno-wallet', 'juno-wallet-store');
export const versionIdbStore = createStore('juno-version', 'juno-version-store');
export const releasesIdbStore = createStore('juno-releases', 'juno-releases-store');

// Loaded and set on the UI side
export const snapshotsIdbStore = createStore('juno-snapshot', 'juno-snapshot-store');
export const subnetsIdbStore = createStore('juno-subnet', 'juno-subnet-store');
