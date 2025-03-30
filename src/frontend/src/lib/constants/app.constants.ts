export const APP_VERSION = VITE_APP_VERSION;

export const DEV = import.meta.env.DEV;

export const LOCAL_REPLICA_URL = 'http://localhost:5987';

// Workers
export const AUTH_TIMER_INTERVAL = 1000;
export const SYNC_CYCLES_TIMER_INTERVAL = 60000;
export const SYNC_CUSTOM_DOMAIN_TIMER_INTERVAL = 10000;
export const SYNC_WALLET_TIMER_INTERVAL = 30000;
export const SYNC_MONITORING_TIMER_INTERVAL = 3600000;
export const SYNC_TOKENS_TIMER_INTERVAL = 60000;

// Timer UI
export const SYNC_LOGS_TIMER_INTERVAL = 60000;

// How long the delegation identity should remain valid?
// e.g. BigInt(7 * 24 * 60 * 60 * 1000 * 1000 * 1000) = 7 days in nanoseconds
export const AUTH_MAX_TIME_TO_LIVE = BigInt(7 * 24 * 60 * 60 * 1000 * 1000 * 1000);

export const AUTH_POPUP_WIDTH = 576;
export const AUTH_POPUP_HEIGHT = 625;

export const E8S_PER_ICP = 100_000_000n;
export const IC_TRANSACTION_FEE_ICP = 10_000n;
export const TOP_UP_NETWORK_FEES = 2n * IC_TRANSACTION_FEE_ICP;

export const CYCLES_WARNING = 500_000_000_000n;
export const MEMORY_HEAP_WARNING = 900_000_000n; // 900mb

export const ONE_TRILLION = 1_000_000_000_000;

export const DEFAULT_TCYCLES_TO_RETAIN_ON_DELETION = 0.5;

export const PAGINATION = 10n;

export const INTERNET_IDENTITY_CANISTER_ID = 'rdmx6-jaaaa-aaaaa-aaadq-cai';
export const CMC_CANISTER_ID = 'rkp4c-7iaaa-aaaaa-aaaca-cai';
export const CONSOLE_CANISTER_ID = 'cokmz-oiaaa-aaaal-aby6q-cai';
export const OBSERVATORY_CANISTER_ID = 'klbfr-lqaaa-aaaak-qbwsa-cai';
export const ICP_LEDGER_CANISTER_ID = 'ryjl3-tyaaa-aaaaa-aaaba-cai';

/**
 * Revoked principals that must not be used.
 *
 * @see https://forum.dfinity.org/t/agent-js-insecure-key-generation-in-ed25519keyidentity-generate/27732
 */
export const REVOKED_CONTROLLERS: string[] = [
	'535yc-uxytb-gfk7h-tny7p-vjkoe-i4krp-3qmcl-uqfgr-cpgej-yqtjq-rqe'
];

export const JUNO_SUBNET_ID = '6pbhf-qzpdk-kuqbr-pklfa-5ehhf-jfjps-zsj6q-57nrl-kzhpd-mu7hc-vae';
