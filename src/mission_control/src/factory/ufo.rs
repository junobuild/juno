use crate::factory::msg::UFO_NOT_FOUND;
use crate::factory::store::{add_ufo, delete_ufo, get_ufo};
use crate::types::state::Ufo;
use junobuild_shared::types::state::UfoId;

pub fn attach_ufo(ufo_id: &UfoId, name: &Option<String>) -> Result<Ufo, String> {
    let ufo = get_ufo(ufo_id);

    match ufo {
        Some(_) => Err("UFO already added to mission control.".to_string()),
        None => {
            // No assertion for Ufo

            let ufo = add_ufo(ufo_id, name);

            Ok(ufo)
        }
    }
}

pub fn detach_ufo(ufo_id: &UfoId) -> Result<(), String> {
    let ufo = get_ufo(ufo_id);

    match ufo {
        None => Err(UFO_NOT_FOUND.to_string()),
        Some(_ufo) => {
            delete_ufo(ufo_id);

            Ok(())
        }
    }
}
