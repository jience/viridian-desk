use std::process::Command;

fn get_git_commit_hash() -> String {
    let result = Command::new("git")
        .args(["rev-parse", "--short=8", "HEAD"])
        .output();

    match result {
        Ok(output) if output.status.success() => String::from_utf8(output.stdout)
            .unwrap_or_default()
            .trim()
            .to_string(),
        _ => "unknown".to_string(),
    }
}

fn main() {
    let git_hash = get_git_commit_hash();
    println!("cargo:rustc-env=GIT_HASH={}", git_hash);
    println!("cargo:rerun-if-changed=.git/HEAD");

    // If the "thin_client" feature is enabled during the build,
    // set a TAURI_IS_THIN_CLIENT environment variable.
    if std::env::var("CARGO_CFG_FEATURE_THIN_CLIENT").is_ok() {
        println!("cargo:rustc-env=TAURI_IS_THIN_CLIENT=true");
    } else {
        println!("cargo:rustc-env=TAURI_IS_THIN_CLIENT=false");
    }

    tauri_build::build();
}
