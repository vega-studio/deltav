#!/bin/bash!
git branch -D release
git checkout -b release
git fetch
git reset --hard origin/dev
runner release-notes -f RELEASE_NOTES.md --update-package
