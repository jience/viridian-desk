#!/bin/bash
# Author: Alex Zhang
# Function: Build client application for Jenkins or manually.


CURRENT_DIR=$(cd "$(dirname "$0")"; pwd)
ROOT_DIR=$(dirname "$CURRENT_DIR")
BRANCH=$(git symbolic-ref --short HEAD)

function usage {
  echo "Usage:"
  echo "  build.sh -v <version> [-a name] [-b build_num] [-i arch] [-t timestamp] [-o output_dir] [-p pkg_type] [-s deps_dir] [-c]"
  echo ""
  echo "This is an client build and packaging script for Jenkins or manually."
  echo ""
  echo "  -h, --help                     This small usage guide."
  echo "  -a                             Client name. Default: Client"
  echo "  -v                             Client version number. (Required)"
  echo "  -b                             Client build number. Default: git commit count"
  echo "  -i                             Client build arch info. Default: system arch"
  echo "  -t                             Client build timestamp. Default: current timestamp"
  echo "  -o                             Client package output directory. Default: ./debbuild"
  echo "  -p                             Client package type. Default: deb"
  echo "  -s                             HDP-Viewer depends package directory. Default: ./hdp-deps"
  echo "  -c                             Build for thin client (adds --features thin_client)."
  echo "Example:"
  echo "  build.sh -a Client -v 2.0.0 -b 1 -t 1712977903 -i amd64 -p deb -c"
  echo ""
  exit 0
}

function package_info() {
  echo "====================================================================================================="
  echo "Client build information:"
  echo "  Package name: ${PAG_NAME_NEW}"
  echo "  Package version: ${VERSION}"
  echo "  Package arch: ${ARCH}"
  echo "  Package build time: ${TIMESTAMP}"
  echo "  Package output directory: ${OUTPUT_DIR}"
  echo "  Package is thin client: ${IS_THIN_CLIENT}"
  echo "  HDP-Viewer depends package directory: ${HDP_DEPS_DIR}"
  echo "====================================================================================================="
}

while getopts ":a:v:b:i:t:o:p:s:ch" opt; do
  case $opt in
    a) a=$OPTARG ;;
    v) v=$OPTARG ;;
    b) b=$OPTARG ;;
    i) i=$OPTARG ;;
    t) t=$OPTARG ;;
    o) o=$OPTARG ;;
    p) p=$OPTARG ;;
    s) s=$OPTARG ;;
    c) c_flag=true ;;
    h)
      usage
      ;;
    :)
      echo "ERROR: -$OPTARG expects an corresponding argument"
      usage
      ;;
    \?)
      echo "ERROR: unknown option -$OPTARG"
      usage
      ;;
  esac
done
shift $(($OPTIND - 1))

function set_env() {
  # Set default values for arguments using modern shell parameter expansion
  APP_NAME="${a:-Client}"
  CORE_VERSION="${v}" # No default for required version
  BUILD_NUMBER="${b:-$(git rev-list --count "$BRANCH")}"
  ARCH="${i:-$(arch)}"
  TIMESTAMP="${t:-$(date +%s)}"
  OUTPUT_DIR="${o:-${ROOT_DIR}/debbuild}"
  PKG_TARGET="${p:-deb}"
  HDP_DEPS_DIR="${s:-${CURRENT_DIR}/hdp-deps}"
  OS="$(uname -s)"

  # Set feature flags based on arguments
  if [ "$c_flag" = true ]; then
    FEATURES="--features thin_client"
    IS_THIN_CLIENT=true
  else
    FEATURES=""
    IS_THIN_CLIENT=false
  fi

  # Check for required arguments
  if [ -z "$CORE_VERSION" ]; then
    echo "ERROR: Core version (-v) is a required argument."
    usage
  fi

  # The bundle arch
  if [ "$ARCH" == "x86_64" ]; then
    case "${OS}" in
      Linux*)         TAURI_ARCH="amd64";;
      CYGWIN*|MINGW*) TAURI_ARCH="x64-setup";;
      *)              TAURI_ARCH="amd64";;
    esac
  elif [ "$ARCH" == "aarch64" ]; then
      TAURI_ARCH="arm64"
  else
    TAURI_ARCH=${ARCH}
  fi

  # The bundle targets, currently supports [“deb”, “nsis”]
  if [ "$PKG_TARGET" == "deb" ]; then
    PKG_SUFFIX="deb"
  elif [ "$PKG_TARGET" == "nsis" ]; then
    PKG_SUFFIX="exe"
  fi

  export CLIENT_MODULE_NAME="${APP_NAME}"

  VERSION="${CORE_VERSION}-${BUILD_NUMBER}"
  PAG_NAME="Client_${VERSION}_${TAURI_ARCH}.${PKG_SUFFIX}"
  PAG_NAME_NEW="${APP_NAME}_${VERSION}_${TAURI_ARCH}.${PKG_SUFFIX}"

  # Update tauri.conf.json with the new version
  echo "Updating tauri.conf.json version to ${VERSION}"
  sed -i "s/\"version\": \".*\"/\"version\": \"${VERSION}\"/" "${ROOT_DIR}/src-tauri/tauri.conf.json"

  package_info
}

set_env

TAURI_CONF_PATH="${ROOT_DIR}/src-tauri/tauri.conf.json"
TAURI_BUNDLER_OUTPUT_DIR="${ROOT_DIR}/src-tauri/target/release/bundle/${PKG_TARGET}"
TAURI_BUNDLER_OUTPUT_PATH="${TAURI_BUNDLER_OUTPUT_DIR}/${PAG_NAME_NEW}"

# Backup tauri.conf.json before build and ensure it's restored on exit
#cp "${TAURI_CONF_PATH}" "${TAURI_CONF_PATH}.bak"
# The trap will automatically restore the file upon exit (success or failure)
#trap 'mv "${TAURI_CONF_PATH}.bak" "${TAURI_CONF_PATH}"; echo "Restored tauri.conf.json"' EXIT

echo "[Step 0/3] Starting Install frontend packages build process..."
pushd "$ROOT_DIR"
pnpm install
popd

echo "[Step 1/3] Starting Tauri build process..."
# Run the main Tauri build command.
# This will build the frontend, compile the Rust backend, and bundle the application.
# The `tauri build` command will set the TAURI_BUNDLER_OUTPUT_PATHS environment variable.
pushd "$ROOT_DIR/src-tauri"
cargo clean
popd
pnpm run tauri build $FEATURES
mv ${TAURI_BUNDLER_OUTPUT_DIR}/${PAG_NAME} ${TAURI_BUNDLER_OUTPUT_PATH}
mv "${TAURI_BUNDLER_OUTPUT_DIR}/${PAG_NAME}.sig" "${TAURI_BUNDLER_OUTPUT_PATH}.sig"

echo "[Step 2/3] Generating metadata..."
# Run the node script and capture its output for the next step.
# This script relies on the environment variable set by the previous command.
export TAURI_BUNDLER_OUTPUT_PATHS="[\"${TAURI_BUNDLER_OUTPUT_PATH}\"]"
METADATA_SCRIPT_OUTPUT=$(node scripts/generate-metadata.js)

# Echo the output from the node script for logging.
echo "$METADATA_SCRIPT_OUTPUT"

# Extract variables from the script output
METADATA_PATH=$(echo "$METADATA_SCRIPT_OUTPUT" | grep 'METADATA_PATH=' | cut -d'=' -f2)
METADATA_OUTPUT_DIR=$(echo "$METADATA_SCRIPT_OUTPUT" | grep 'OUTPUT_DIR=' | cut -d'=' -f2)

# Check if paths were found
if [ -z "$METADATA_PATH" ] || [ -z "$METADATA_OUTPUT_DIR" ]; then
    echo "Error: Could not determine artifact paths from the metadata script. Exiting."
    exit 1
fi

# Get just the filenames
ARTIFACT_FILENAME=$(basename "$TAURI_BUNDLER_OUTPUT_PATH")

echo "[Step 3/3] Creating ZIP archive: $ZIP_FILENAME..."
# Create a name for the zip file (e.g., Client-2.0.1.zip)
ZIP_FILENAME="${APP_NAME}_${VERSION}_${TAURI_ARCH}.zip"
ZIP_FILEPATH=$OUTPUT_DIR/$ZIP_FILENAME

# Clean and create the output directory structure
rm -rf "${OUTPUT_DIR}"
mkdir -p "${OUTPUT_DIR}"

# Create the zip archive.
zip -rj "$ZIP_FILEPATH" "$TAURI_BUNDLER_OUTPUT_PATH" "$METADATA_PATH"

echo "Build process complete. ZIP archive created at: $ZIP_FILEPATH"
