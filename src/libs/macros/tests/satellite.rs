use junobuild_macros::{on_post_upgrade, on_set_doc};

struct Doc;

#[on_set_doc]
async fn on_set_doc(_doc: Doc) {}

#[on_post_upgrade]
async fn on_post_upgrade() {}
