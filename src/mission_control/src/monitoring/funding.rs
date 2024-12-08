use canfund::api::cmc::IcCyclesMintingCanister;
use canfund::api::ledger::IcLedgerCanister;
use canfund::manager::options::{FundManagerOptions, ObtainCyclesOptions};
use canfund::operations::obtain::MintCycles;
use ic_ledger_types::{MAINNET_CYCLES_MINTING_CANISTER_ID, MAINNET_LEDGER_CANISTER_ID};
use ic_ledger_types_for_canfund::DEFAULT_SUBACCOUNT;
use std::rc::Rc;
use std::sync::Arc;
use canfund::FundManager;
use canfund::manager::RegisterOpts;
use crate::types::state::CyclesMonitoringStrategy;

pub fn init_funding_manager() -> FundManager {
    let mut fund_manager = FundManager::new();
    fund_manager.with_options(init_funding_config());
    fund_manager
}

pub fn init_register_options(cycles_strategy: &CyclesMonitoringStrategy) -> Result<RegisterOpts, String> {
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
