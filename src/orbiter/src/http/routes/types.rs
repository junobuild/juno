use ic_http_certification::{DefaultFullCelExpression, HttpCertificationPath};

pub struct CertifiedExactRoute {
    pub path: String,
    pub tree_path: HttpCertificationPath<'static>,
    pub cel_expr_def: DefaultFullCelExpression<'static>,
    pub cel_expr: String,
}
