---
title: "Consolidate UI Components and Fix Import Paths"
labels: refactoring, ui, technical-debt
assignees: ""
---

**Description of the Problem**
We have duplicate UI components in multiple directories with inconsistent import paths, causing TypeScript errors. While the components themselves use consistent PascalCase naming, they are being imported with different casings and from different locations.

**Current State**
1. Main UI components in `/components/ui/`:
   - Using PascalCase (e.g., `Button.tsx`, `Card.tsx`)
   - Exported via `index.tsx` with PascalCase
   - Contains all component definitions

2. Duplicate components in `/app/components/ui/`:
   - Also using PascalCase
   - Contains duplicates of `Badge.tsx`, `Button.tsx`, `Card.tsx`
   - Includes test files (`.test.tsx`)

3. Import inconsistencies:
   - Some files import from `@/components/ui/Button`
   - Others import from `@/components/ui/button`
   - TypeScript's `forceConsistentCasingInFileNames` is flagging these as errors

**Proposed Changes**
1. Remove duplicate components:
   - Move test files from `/app/components/ui/` to `/components/ui/`
   - Delete duplicate component files from `/app/components/ui/`

2. Standardize imports:
   - Update all imports to use PascalCase (e.g., `@/components/ui/Button`)
   - Use the `index.tsx` exports where possible

3. Update build configuration:
   - Ensure test files are properly configured
   - Verify TypeScript paths are correct

**Acceptance Criteria**
- [ ] No duplicate component files exist
- [ ] All imports use PascalCase consistently
- [ ] All test files are properly located and configured
- [ ] TypeScript builds without casing-related errors
- [ ] All tests pass after the consolidation
- [ ] No runtime errors in development or production

**Implementation Steps**
1. Create a backup branch
2. Move test files to `/components/ui/`
3. Delete duplicate component files
4. Update all import statements to use PascalCase
5. Run TypeScript checks and tests
6. Deploy to staging for verification

**Additional Context**
This consolidation is needed before deployment to:
1. Eliminate duplicate code
2. Ensure consistent component usage
3. Fix TypeScript errors
4. Improve maintainability

The issue is more about duplicate files and import paths than file casing, as the components themselves are consistently using PascalCase. 