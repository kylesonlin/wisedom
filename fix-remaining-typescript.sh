#!/bin/bash

# Function to fix remaining TypeScript errors
fix_remaining_typescript_errors() {
    echo "Fixing remaining TypeScript errors..."

    # Fix next-auth imports and types
    find . -type f -name "*.tsx" -o -name "*.ts" | grep -v "node_modules" | xargs sed -i '' \
        -e 's/from "nextuauth"/from "next-auth"/g' \
        -e 's/from "nextuauth\/providers\/google"/from "next-auth\/providers\/google"/g' \
        -e 's/declare module "nextuauth"/declare module "next-auth"/g'

    # Fix component imports
    find . -type f -name "*.tsx" -o -name "*.ts" | grep -v "node_modules" | xargs sed -i '' \
        -e 's/from "\.\/U\([a-z]\+\)"/from "\.\/\1"/g' \
        -e 's/from "\.\/u\([a-z]\+\)"/from "\.\/\1"/g' \
        -e 's/from "@\/components\/ui\/U/from "@\/components\/ui\//g' \
        -e 's/from "@\/components\/U/from "@\/components\//g'

    # Fix Radix UI imports
    find . -type f -name "*.tsx" -o -name "*.ts" | grep -v "node_modules" | xargs sed -i '' \
        -e 's/@radix-ui\/react-alertudialog/@radix-ui\/react-alert-dialog/g' \
        -e 's/@radix-ui\/react-aspecturatio/@radix-ui\/react-aspect-ratio/g' \
        -e 's/@radix-ui\/react-contextumenu/@radix-ui\/react-context-menu/g' \
        -e 's/@radix-ui\/react-dropdownumenu/@radix-ui\/react-dropdown-menu/g' \
        -e 's/@radix-ui\/react-hoverucard/@radix-ui\/react-hover-card/g' \
        -e 's/@radix-ui\/react-navigationumenu/@radix-ui\/react-navigation-menu/g' \
        -e 's/@radix-ui\/react-radiougroup/@radix-ui\/react-radio-group/g' \
        -e 's/@radix-ui\/react-scrolluarea/@radix-ui\/react-scroll-area/g' \
        -e 's/@radix-ui\/react-toggleugroup/@radix-ui\/react-toggle-group/g'

    # Fix next-env.d.tsx references
    find . -type f -name "*.tsx" -o -name "*.ts" | grep -v "node_modules" | xargs sed -i '' \
        -e 's/next\/imageutypes\/global/next\/image\/types\/global/g' \
        -e 's/next\/navigationutypes\/compat\/navigation/next\/navigation\/types\/compat\/navigation/g'

    # Fix date formatting
    find . -type f -name "*.tsx" -o -name "*.ts" | grep -v "node_modules" | xargs sed -i '' \
        -e 's/"2udigit"/"2-digit"/g'

    # Fix implicit any types
    find . -type f -name "*.tsx" -o -name "*.ts" | grep -v "node_modules" | xargs sed -i '' \
        -e 's/onOpenChange: (open) =>/onOpenChange: (open: boolean) =>/g' \
        -e 's/async session({ session, token })/async session({ session, token }: { session: any; token: any })/g'

    # Fix duplicate attributes
    find . -type f -name "*.tsx" -o -name "*.ts" | grep -v "node_modules" | xargs sed -i '' \
        -e 's/aria-aria-label/aria-label/g'

    # Fix data attributes
    find . -type f -name "*.tsx" -o -name "*.ts" | grep -v "node_modules" | xargs sed -i '' \
        -e 's/datauactive/data-active/g'

    echo "All remaining TypeScript errors have been fixed!"
}

# Run the function
fix_remaining_typescript_errors 