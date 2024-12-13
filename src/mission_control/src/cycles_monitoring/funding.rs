use crate::types::state::CyclesMonitoringStrategy;
use canfund::api::cmc::IcCyclesMintingCanister;
use canfund::api::ledger::IcLedgerCanister;
use canfund::manager::options::{FundManagerOptions, ObtainCyclesOptions};
use canfund::manager::RegisterOpts;
use canfund::operations::obtain::MintCycles;
use canfund::FundManager;
use ic_ledger_types::{
    DEFAULT_SUBACCOUNT, MAINNET_CYCLES_MINTING_CANISTER_ID, MAINNET_LEDGER_CANISTER_ID,
};
use junobuild_shared::types::state::SegmentId;
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
        .with_obtain_cycles_options( Some(ObtainCyclesOptions {
            obtain_cycles: Arc::new(MintCycles {
                ledger: Arc::new(IcLedgerCanister::new(MAINNET_LEDGER_CANISTER_ID)),
                cmc: Arc::new(IcCyclesMintingCanister::new(
                    MAINNET_CYCLES_MINTING_CANISTER_ID,
                )),
                from_subaccount: DEFAULT_SUBACCOUNT,
            }),
        }))
        .with_funding_callback(Rc::new(|records| {

            // TODO: to be removed

            ic_cdk::print("-----> Callback");

            // Loop over the hashmap of canister records and print the cycles balance and total of deposited cycles
            for (canister_id, record) in records.iter() {
                let cycles = record.get_cycles().as_ref().map_or(0, |c| c.amount);
                let deposited_cycles = record
                    .get_deposited_cycles()
                    .as_ref()
                    .map_or(0, |c| c.amount);
                ic_cdk::print(format!(
                    "Canister {canister_id} had {cycles} cycles and got {deposited_cycles} deposited cycles"
                ));
            }
        }))
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
