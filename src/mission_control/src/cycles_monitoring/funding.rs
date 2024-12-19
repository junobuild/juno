use crate::cycles_monitoring::store::stable::insert_cycles_monitoring_history;
use crate::types::state::{CyclesBalance, CyclesMonitoringStrategy, MonitoringHistoryCycles};
use canfund::api::cmc::IcCyclesMintingCanister;
use canfund::api::ledger::IcLedgerCanister;
use canfund::manager::options::{FundManagerOptions, ObserverCallback, ObtainCyclesOptions};
use canfund::manager::record::CanisterRecord;
use canfund::manager::RegisterOpts;
use canfund::operations::obtain::MintCycles;
use canfund::FundManager;
use ic_cdk::api::management_canister::main::CanisterId;
use ic_ledger_types::{
    DEFAULT_SUBACCOUNT, MAINNET_CYCLES_MINTING_CANISTER_ID, MAINNET_LEDGER_CANISTER_ID,
};
use junobuild_shared::types::state::SegmentId;
use std::collections::HashMap;
use std::rc::Rc;
use std::sync::Arc;

pub fn init_funding_manager() -> FundManager {
    let mut fund_manager = FundManager::new();
    fund_manager.with_options(init_funding_config());
    fund_manager
}

pub fn init_register_options(
    cycles_strategy: &CyclesMonitoringStrategy,
) -> Result<RegisterOpts, String> {
    let fund_strategy = cycles_strategy.to_fund_strategy()?;
    let options = RegisterOpts::new().with_strategy(fund_strategy.clone());
    Ok(options)
}

fn init_funding_config() -> FundManagerOptions {
    FundManagerOptions::new()
        // TODO: Integrate in mission control config
        .with_interval_secs(30)
        .with_obtain_cycles_options(Some(obtain_cycles_options()))
        .with_funding_callback(funding_callback())
}

fn obtain_cycles_options() -> ObtainCyclesOptions {
    ObtainCyclesOptions {
        obtain_cycles: Arc::new(MintCycles {
            ledger: Arc::new(IcLedgerCanister::new(MAINNET_LEDGER_CANISTER_ID)),
            cmc: Arc::new(IcCyclesMintingCanister::new(
                MAINNET_CYCLES_MINTING_CANISTER_ID,
            )),
            from_subaccount: DEFAULT_SUBACCOUNT,
        }),
    }
}

fn funding_callback() -> ObserverCallback {
    Rc::new(|records: HashMap<CanisterId, CanisterRecord>| {
        save_monitoring_history(records);
    })
}

fn save_monitoring_history(records: HashMap<CanisterId, CanisterRecord>) {
    for (canister_id, record) in records.iter() {
        if let Some(cycles) = record.get_cycles() {
            let last_deposited_cycles =
                record
                    .get_last_deposited_cycles()
                    .clone()
                    .map(|last_deposited| CyclesBalance {
                        amount: last_deposited.amount,
                        timestamp: last_deposited.timestamp,
                    });

            let history_entry: MonitoringHistoryCycles = MonitoringHistoryCycles {
                cycles: CyclesBalance {
                    amount: cycles.amount,
                    timestamp: cycles.timestamp,
                },
                last_deposited_cycles,
            };

            insert_cycles_monitoring_history(&canister_id, &history_entry);
        }
    }
}

pub fn register_cycles_monitoring(
    fund_manager: &mut FundManager,
    segment_id: &SegmentId,
    strategy: &CyclesMonitoringStrategy,
) -> Result<(), String> {
    // Register does not overwrite the configuration. That's why we unregister first given that we support updating configuration.
    fund_manager.unregister(*segment_id);
    fund_manager.register(*segment_id, init_register_options(strategy)?);
    Ok(())
}
