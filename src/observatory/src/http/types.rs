use serde::Serialize;

#[derive(Serialize)]
pub struct EmailRequestBody {
    pub from: String,
    pub to: Vec<String>,
    pub subject: String,
    pub html: String,
    pub text: String,
}
