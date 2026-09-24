use std::fs;
use std::path::PathBuf;
use tauri::Manager;

const USER_DATA_SEED_REVISION: &str = "2026-09-23-aliases-presets-1";
const SEEDED_ALIASES: &str = include_str!("../seed-data/aliases.json");
const SEEDED_BUILD_PRESETS: &str = include_str!("../seed-data/build-presets.json");

#[tauri::command]
fn read_data_file(app: tauri::AppHandle, name: String) -> Result<Option<String>, String> {
  let path = data_file_path(&app, &name)?;
  if !path.exists() {
    return Ok(None);
  }
  fs::read_to_string(path).map(Some).map_err(|error| error.to_string())
}

#[tauri::command]
fn write_data_file(app: tauri::AppHandle, name: String, contents: String) -> Result<(), String> {
  let path = data_file_path(&app, &name)?;
  if let Some(parent) = path.parent() {
    fs::create_dir_all(parent).map_err(|error| error.to_string())?;
  }
  fs::write(path, contents).map_err(|error| error.to_string())
}

#[tauri::command]
fn data_dir(app: tauri::AppHandle) -> Result<String, String> {
  let dir = app_data_dir(&app)?;
  fs::create_dir_all(&dir).map_err(|error| error.to_string())?;
  Ok(dir.to_string_lossy().to_string())
}

fn data_file_path(app: &tauri::AppHandle, name: &str) -> Result<PathBuf, String> {
  let clean = name.replace('\\', "/");
  if clean.starts_with('/') || clean.contains("../") || clean == ".." {
    return Err("invalid data file name".to_string());
  }
  Ok(app_data_dir(app)?.join(clean))
}

fn app_data_dir(app: &tauri::AppHandle) -> Result<PathBuf, String> {
  app.path().app_data_dir().map_err(|error| error.to_string())
}

fn install_user_data_seed(app: &tauri::AppHandle) -> Result<(), String> {
  let dir = app_data_dir(app)?;
  fs::create_dir_all(&dir).map_err(|error| error.to_string())?;
  let marker = dir.join(".user-data-seed");
  if fs::read_to_string(&marker).ok().as_deref() == Some(USER_DATA_SEED_REVISION) {
    return Ok(());
  }
  fs::write(dir.join("aliases.json"), SEEDED_ALIASES).map_err(|error| error.to_string())?;
  fs::write(dir.join("build-presets.json"), SEEDED_BUILD_PRESETS).map_err(|error| error.to_string())?;
  fs::write(marker, USER_DATA_SEED_REVISION).map_err(|error| error.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .setup(|app| {
      install_user_data_seed(app.handle())?;
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .invoke_handler(tauri::generate_handler![read_data_file, write_data_file, data_dir])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
