# Repository Dynamics: Wisedom and Wisedom-Marketing

## Overview
This document outlines the dynamics of the two separate codebases for the Wisedom platform:
1. **Wisedom (Main Application)**: [Production Deployment on Vercel](https://vercel.com/kyle-sonlins-projects/wisedom-app)
2. **Wisedom-Marketing**: Located at [kylesonlin/wisedom-marketing](https://github.com/kylesonlin/wisedom-marketing).

## Key Points

### Separate Repositories
- Each codebase is maintained in its own git repository.
- Changes to one repository do not automatically affect the other.

### Pushing Changes
- **Wisedom (Main Application)**:
  - Push changes using `git push origin main` from the `wisedom-app` directory.
  - If history is rewritten (e.g., after cleaning large files), use `git push --force origin main`.
  - Ensure `.gitignore` is set up to exclude `node_modules`, `.next`, and other build artifacts.
  - Production deployments are managed via [Vercel](https://vercel.com/kyle-sonlins-projects/wisedom-app).

- **Wisedom-Marketing**:
  - Push changes using `git push origin main` from the `wisedom-marketing` directory.
  - Ensure `.gitignore` is configured to exclude unnecessary files.

### Collaboration
- If you collaborate with others, inform them of any history rewrites or force pushes.
- Each repository should be cloned or reset independently.

## Best Practices
- Always check the current directory before committing or pushing changes.
- Review `.gitignore` files to prevent large or unnecessary files from being committed.
- Test changes locally before pushing to ensure everything works as expected.

## Conclusion
By following these guidelines, you can avoid confusion and ensure smooth collaboration across both codebases. 