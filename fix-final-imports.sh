#!/bin/bash

# Function to fix final import issues
fix_final_imports() {
    echo "Fixing final import issues..."

    # Copy UI components from app/components/ui to components/ui
    cd app/components/ui
    for file in *.tsx; do
        if [ -f "$file" ]; then
            cp "$file" "../../../components/ui/${file}"
            echo "Copied $file to components/ui/"
        fi
    done
    cd ../../..

    # Update imports in all files
    find . -type f -name "*.tsx" -o -name "*.ts" | grep -v "node_modules" | xargs sed -i '' \
        -e 's/from "\.\/Button"/from "@\/components\/ui\/Button"/g' \
        -e 's/from "\.\/Card"/from "@\/components\/ui\/Card"/g' \
        -e 's/from "\.\/Input"/from "@\/components\/ui\/Input"/g' \
        -e 's/from "\.\/Badge"/from "@\/components\/ui\/Badge"/g' \
        -e 's/from "\.\/Modal"/from "@\/components\/ui\/Modal"/g' \
        -e 's/from "\.\/Select"/from "@\/components\/ui\/Select"/g' \
        -e 's/from "\.\/Checkbox"/from "@\/components\/ui\/Checkbox"/g' \
        -e 's/from "\.\/Radio"/from "@\/components\/ui\/Radio"/g' \
        -e 's/from "\.\/Textarea"/from "@\/components\/ui\/Textarea"/g' \
        -e 's/from "\.\/FormDatePicker"/from "@\/components\/ui\/FormDatePicker"/g' \
        -e 's/from "\.\/FileUpload"/from "@\/components\/ui\/FileUpload"/g' \
        -e 's/from "\.\/Tabs"/from "@\/components\/ui\/Tabs"/g' \
        -e 's/from "\.\/Avatar"/from "@\/components\/ui\/Avatar"/g' \
        -e 's/from "\.\/Progress"/from "@\/components\/ui\/Progress"/g' \
        -e 's/from "\.\/Calendar"/from "@\/components\/ui\/Calendar"/g' \
        -e 's/from "\.\/Separator"/from "@\/components\/ui\/Separator"/g' \
        -e 's/from "\.\/Sheet"/from "@\/components\/ui\/Sheet"/g' \
        -e 's/from "\.\/Skeleton"/from "@\/components\/ui\/Skeleton"/g' \
        -e 's/from "\.\/ScrollArea"/from "@\/components\/ui\/ScrollArea"/g' \
        -e 's/from "\.\/Tooltip"/from "@\/components\/ui\/Tooltip"/g' \
        -e 's/from "\.\/DropdownMenu"/from "@\/components\/ui\/DropdownMenu"/g' \
        -e 's/from "\.\/Toast"/from "@\/components\/ui\/Toast"/g' \
        -e 's/from "\.\/Dialog"/from "@\/components\/ui\/Dialog"/g' \
        -e 's/from "\.\/Label"/from "@\/components\/ui\/Label"/g' \
        -e 's/from "\.\/Popover"/from "@\/components\/ui\/Popover"/g' \
        -e 's/from "\.\/Toggle"/from "@\/components\/ui\/Toggle"/g' \
        -e 's/from "\.\/ToggleGroup"/from "@\/components\/ui\/ToggleGroup"/g' \
        -e 's/from "\.\/Toaster"/from "@\/components\/ui\/Toaster"/g'

    # Fix next-auth imports
    find . -type f -name "*.tsx" -o -name "*.ts" | grep -v "node_modules" | xargs sed -i '' \
        -e 's/from "nextuauth"/from "next-auth"/g' \
        -e 's/from "nextuauth\/providers\/google"/from "next-auth\/providers\/google"/g' \
        -e 's/declare module "nextuauth"/declare module "next-auth"/g'

    # Fix date formatting
    find . -type f -name "*.tsx" -o -name "*.ts" | grep -v "node_modules" | xargs sed -i '' \
        -e 's/"2udigit"/"2-digit"/g'

    # Fix duplicate attributes
    find . -type f -name "*.tsx" -o -name "*.ts" | grep -v "node_modules" | xargs sed -i '' \
        -e 's/size="default" {...props}/...props/g' \
        -e 's/aria-label="Toggle Sidebar"/data-label="Toggle Sidebar"/g'

    echo "Final import issues have been fixed!"
}

# Run the function
fix_final_imports 