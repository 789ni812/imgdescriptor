# public/vs/

This directory is used for storing user-uploaded or environment-specific assets for the tournament feature, such as:

- Fighter images and metadata
- Arena images and metadata

## Development
- All files in this directory are **gitignored** during development to avoid committing large or sensitive assets.
- Only `.gitkeep` (to preserve the folder structure) and this `README.md` are tracked in git.

## Production/Deployment
- When deploying to production, upload the required images and JSON files to this folder as part of your deployment process.
- This keeps your repository clean and avoids leaking development/test data. 