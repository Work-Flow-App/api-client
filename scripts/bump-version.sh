#!/bin/bash
set -e

BUMP_TYPE=${1:-patch}

if [[ "$BUMP_TYPE" != "patch" && "$BUMP_TYPE" != "minor" && "$BUMP_TYPE" != "major" ]]; then
  echo "Invalid bump type: $BUMP_TYPE. Use patch, minor, or major."
  exit 1
fi

npm version "$BUMP_TYPE" --no-git-tag-version

NEW_VERSION=$(node -p "require('./package.json').version")
echo "Bumped to v${NEW_VERSION}"
