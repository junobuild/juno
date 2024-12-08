use crate::memory::{RUNTIME_STATE};
use crate::segments::store::get_satellites;
use candid::Principal;
use canfund::api::cmc::IcCyclesMintingCanister;
use canfund::api::ledger::IcLedgerCanister;
use canfund::manager::options::{
    CyclesThreshold, FundManagerOptions, FundStrategy, ObtainCyclesOptions,
};
use canfund::manager::RegisterOpts;
use canfund::operations::obtain::MintCycles;
use canfund::FundManager;
use ic_cdk::id;
use ic_ledger_types::{MAINNET_CYCLES_MINTING_CANISTER_ID, MAINNET_LEDGER_CANISTER_ID};
use ic_ledger_types_for_canfund::DEFAULT_SUBACCOUNT;
use std::rc::Rc;
use std::sync::Arc;
use crate::types::runtime::RuntimeState;

pub fn init_monitoring() -> Result<(), String> {
    RUNTIME_STATE.with(|state| init_monitoring_impl(&mut state.borrow_mut()))
}

fn init_monitoring_impl(state: &mut RuntimeState) -> Result<(), String> {
    let funding_config = FundManagerOptions::new()
        .with_interval_secs(30)
        .with_strategy(FundStrategy::BelowThreshold(
            CyclesThreshold::new()
                .with_min_cycles(20_025_000_000_000)
                .with_fund_cycles(250_000_000_000),
        ))
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
        }));

    if state.fund_manager.is_none() {
        state.fund_manager = Some(FundManager::new());
    }

    let fund_manager = state.fund_manager.as_mut().ok_or_else(|| {
        "FundManager not initialized. This is unexpected.".to_string()
    })?;

    fund_manager.with_options(funding_config);

    // Register satellites
    let satellites = get_satellites();

    for (satellite_id, _) in satellites {
        fund_manager.register(satellite_id, RegisterOpts::new());
    }

    // Register mission control
    fund_manager.register(id(), RegisterOpts::new());

    fund_manager.start();

    Ok(())
}

pub fn register_monitoring(id: &Principal) {
    RUNTIME_STATE.with(|state| register_monitoring_impl(id, &mut state.borrow_mut()));
}

fn register_monitoring_impl(id: &Principal, state: &mut RuntimeState) {
    // TODO
    // fund_manager.register(id.clone(), RegisterOpts::new());
}
