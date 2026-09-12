#!/usr/bin/env bash
set -euo pipefail

if [[ "${1:-}" == "" || "${2:-}" == "" ]]; then
  echo "Usage: $0 <resource-group> <web-app-name>"
  exit 1
fi

RESOURCE_GROUP="$1"
WEBAPP_NAME="$2"
SUBSCRIPTION_ID="21077d85-2c34-4044-b654-bf12a61fc860"
ZIP_PATH="infra/terraform/deploy.zip"
PACKAGE_DIR="infra/terraform/deploy-package"

az account set --subscription "$SUBSCRIPTION_ID" >/dev/null

npm ci
npm run build

rm -rf "$PACKAGE_DIR"
mkdir -p "$PACKAGE_DIR/.next"

cp -R .next/standalone/. "$PACKAGE_DIR/"
cp -R .next/static "$PACKAGE_DIR/.next/static"
rm -f "$PACKAGE_DIR/package.json"

if [[ -d "public" ]]; then
  cp -R public "$PACKAGE_DIR/public"
fi

rm -f "$ZIP_PATH"
(cd "$PACKAGE_DIR" && zip -rq ../deploy.zip .)

az webapp deploy \
  --resource-group "$RESOURCE_GROUP" \
  --name "$WEBAPP_NAME" \
  --src-path "$ZIP_PATH" \
  --type zip \
  --subscription "$SUBSCRIPTION_ID" \
  --restart true \
  --output table

echo "Deployment requested. App URL: https://${WEBAPP_NAME}.azurewebsites.net"
