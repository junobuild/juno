/// Alias for [`Args::hold(cx, args).release()`]
#[macro_export]
macro_rules! hold_and_release {
    ($cx:expr, $args:expr) => {
        Args::hold($cx, $args).release()
    };
}

/// Alias for [`Args::hold`]
#[macro_export]
macro_rules! hold {
    ($cx:expr, $args:expr) => {
        Args::hold($cx, $args)
    };
}
