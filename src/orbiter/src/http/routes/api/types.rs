use ic_http_certification::{
    DefaultFullCelExpression, DefaultResponseOnlyCelExpression, HttpCertificationPath,
};

pub struct CertifiedExactRoute {
    pub path: String,
    pub tree_path: HttpCertificationPath<'static>,
    pub cel_expr_def: CertifiedCelExprDef,
    pub cel_expr: String,
}

pub enum CertifiedCelExprDef {
    Full(DefaultFullCelExpression<'static>),
    ResponseOnly(DefaultResponseOnlyCelExpression<'static>),
}

