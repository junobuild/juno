use junobuild_macros::on_set_doc;

struct Doc;

#[on_set_doc]
async fn on_set_doc(_doc: Doc) {}
