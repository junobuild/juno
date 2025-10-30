pub trait Validated {
    fn validate(&self) -> Result<(), String>;
}

pub trait OpenIdProfile {
    fn email(&self) -> Option<&str>;
    fn name(&self) -> Option<&str>;
    fn given_name(&self) -> Option<&str>;
    fn family_name(&self) -> Option<&str>;
    fn picture(&self) -> Option<&str>;
    fn locale(&self) -> Option<&str>;
}
