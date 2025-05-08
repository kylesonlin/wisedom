#!/bin/bash

# Function to fix component imports
fix_component_imports() {
    echo "Fixing component imports..."

    # Fix next-auth imports
    find . -type f -name "*.tsx" -o -name "*.ts" | grep -v "node_modules" | xargs sed -i '' \
        -e 's/from "nextuauth"/from "next-auth"/g' \
        -e 's/from "nextuauth\/providers\/google"/from "next-auth\/providers\/google"/g' \
        -e 's/declare module "nextuauth"/declare module "next-auth"/g'

    # Fix component imports in app/components/ui/index.tsx
    find . -type f -name "index.tsx" | grep -v "node_modules" | xargs sed -i '' \
        -e 's/from '\''\.\/Button'\''/from '\''@\/components\/ui\/Button'\''/g' \
        -e 's/from '\''\.\/Card'\''/from '\''@\/components\/ui\/Card'\''/g' \
        -e 's/from '\''\.\/Input'\''/from '\''@\/components\/ui\/Input'\''/g' \
        -e 's/from '\''\.\/Badge'\''/from '\''@\/components\/ui\/Badge'\''/g' \
        -e 's/from '\''\.\/Modal'\''/from '\''@\/components\/ui\/Modal'\''/g' \
        -e 's/from '\''\.\/Select'\''/from '\''@\/components\/ui\/Select'\''/g' \
        -e 's/from '\''\.\/Checkbox'\''/from '\''@\/components\/ui\/Checkbox'\''/g' \
        -e 's/from '\''\.\/Radio'\''/from '\''@\/components\/ui\/Radio'\''/g' \
        -e 's/from '\''\.\/Textarea'\''/from '\''@\/components\/ui\/Textarea'\''/g' \
        -e 's/from '\''\.\/FormDatePicker'\''/from '\''@\/components\/ui\/FormDatePicker'\''/g' \
        -e 's/from '\''\.\/FileUpload'\''/from '\''@\/components\/ui\/FileUpload'\''/g' \
        -e 's/from '\''\.\/Tabs'\''/from '\''@\/components\/ui\/Tabs'\''/g' \
        -e 's/from '\''\.\/Avatar'\''/from '\''@\/components\/ui\/Avatar'\''/g' \
        -e 's/from '\''\.\/Progress'\''/from '\''@\/components\/ui\/Progress'\''/g' \
        -e 's/from '\''\.\/Calendar'\''/from '\''@\/components\/ui\/Calendar'\''/g' \
        -e 's/from '\''\.\/Separator'\''/from '\''@\/components\/ui\/Separator'\''/g' \
        -e 's/from '\''\.\/Sheet'\''/from '\''@\/components\/ui\/Sheet'\''/g' \
        -e 's/from '\''\.\/Skeleton'\''/from '\''@\/components\/ui\/Skeleton'\''/g' \
        -e 's/from '\''\.\/ScrollArea'\''/from '\''@\/components\/ui\/ScrollArea'\''/g' \
        -e 's/from '\''\.\/Tooltip'\''/from '\''@\/components\/ui\/Tooltip'\''/g' \
        -e 's/from '\''\.\/DropdownMenu'\''/from '\''@\/components\/ui\/DropdownMenu'\''/g'

    # Fix truncated imports
    find . -type f -name "*.tsx" -o -name "*.ts" | grep -v "node_modules" | xargs sed -i '' \
        -e 's/from "\.\/tton"/from "\.\/Button"/g' \
        -e 's/from "\.\/put"/from "\.\/Input"/g' \
        -e 's/from "\.\/eparator"/from "\.\/Separator"/g' \
        -e 's/from "\.\/heet"/from "\.\/Sheet"/g' \
        -e 's/from "\.\/keleton"/from "\.\/Skeleton"/g' \
        -e 's/from "\.\/crollarea"/from "\.\/ScrollArea"/g' \
        -e 's/from "\.\/ooltip"/from "\.\/Tooltip"/g' \
        -e 's/from "\.\/ggle"/from "\.\/Toggle"/g' \
        -e 's/from "@\/components\/ui\/oast"/from "@\/components\/ui\/Toast"/g' \
        -e 's/from "@\/components\/ui\/ialog"/from "@\/components\/ui\/Dialog"/g' \
        -e 's/from "@\/components\/ui\/abel"/from "@\/components\/ui\/Label"/g'

    # Fix external package imports
    find . -type f -name "*.tsx" -o -name "*.ts" | grep -v "node_modules" | xargs sed -i '' \
        -e 's/from '\''reactudayupicker'\''/from '\''react-day-picker'\''/g' \
        -e 's/from '\''reactudropzone'\''/from '\''react-dropzone'\''/g'

    # Fix next type references
    find . -type f -name "*.tsx" -o -name "*.ts" | grep -v "node_modules" | xargs sed -i '' \
        -e 's/next\/imageutypes\/global/next\/image\/types\/global/g' \
        -e 's/next\/navigationutypes\/compat\/navigation/next\/navigation\/types\/compat\/navigation/g'

    # Fix date formatting
    find . -type f -name "*.tsx" -o -name "*.ts" | grep -v "node_modules" | xargs sed -i '' \
        -e 's/"2udigit"/"2-digit"/g'

    # Fix duplicate attributes
    find . -type f -name "*.tsx" -o -name "*.ts" | grep -v "node_modules" | xargs sed -i '' \
        -e 's/size="default" {...props}/...props/g'

    echo "Component imports have been fixed!"
}

# Run the function
fix_component_imports 