use serde::Serialize;

#[derive(Serialize)]
pub struct EmailRequestBody {
    pub to: String,
    pub title: String,
    pub content: String,
}
