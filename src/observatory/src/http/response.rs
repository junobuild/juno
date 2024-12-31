use ic_cdk::api::management_canister::http_request::{
    HttpHeader, HttpResponse as HttpResponseCdk, TransformArgs as TransformArgsCdk,
};

// Strips all data that is not needed from the original response.
pub fn transform_response(raw: TransformArgsCdk) -> HttpResponseCdk {
    let headers = vec![
        HttpHeader {
            name: "Content-Security-Policy".to_string(),
            value: "default-src 'self'".to_string(),
        },
        HttpHeader {
            name: "Referrer-Policy".to_string(),
            value: "strict-origin".to_string(),
        },
        HttpHeader {
            name: "Permissions-Policy".to_string(),
            value: "geolocation=(self)".to_string(),
        },
        HttpHeader {
            name: "Strict-Transport-Security".to_string(),
            value: "max-age=63072000".to_string(),
        },
        HttpHeader {
            name: "X-Frame-Options".to_string(),
            value: "DENY".to_string(),
        },
        HttpHeader {
            name: "X-Content-Type-Options".to_string(),
            value: "nosniff".to_string(),
        },
    ];

    let mut res = HttpResponseCdk {
        status: raw.response.status.clone(),
        body: raw.response.body.clone(),
        headers,
        ..Default::default()
    };

    if i32::try_from(res.status.clone().0).unwrap() == 200 {
        res.body = raw.response.body;
    } else {
        ic_cdk::api::print(format!("Received an error from proxy: err = {:?}", raw));
    }

    res
}
