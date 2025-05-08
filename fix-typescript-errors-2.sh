#!/bin/bash

# Function to fix TypeScript errors
fix_typescript_errors() {
    # Fix aria attributes
    find . -type f -name "*.tsx" -o -name "*.ts" | grep -v "node_modules" | xargs sed -i '' \
        -e 's/ariaulabel/aria-label/g' \
        -e 's/ariauinvalid/aria-invalid/g' \
        -e 's/dataumobile/data-mobile/g' \
        -e 's/datausize/data-size/g'

    # Fix import paths
    find . -type f -name "*.tsx" -o -name "*.ts" | grep -v "node_modules" | xargs sed -i '' \
        -e 's/from "\.\/U/from "\.\//g' \
        -e 's/from "@\/components\/ui\/U/from "@\/components\/ui\//g' \
        -e 's/from "\.\/u/from "\.\//g' \
        -e 's/from "@\/components\/ui\/u/from "@\/components\/ui\//g' \
        -e 's/from "\.\/[A-Z]/from "\.\//g' \
        -e 's/from "@\/components\/ui\/[A-Z]/from "@\/components\/ui\//g' \
        -e 's/from "\.\/[a-z]/from "\.\//g' \
        -e 's/from "@\/components\/ui\/[a-z]/from "@\/components\/ui\//g'

    # Fix file extensions
    find . -type f -name "*.tsx" -o -name "*.ts" | grep -v "node_modules" | while read -r file; do
        mv "$file" "${file%.*}.tsx"
    done

    # Fix file casing
    for file in components/ui/*.tsx; do
        filename=$(basename "$file")
        newname=$(echo "$filename" | sed -E 's/^(.)/\u\1/g' | sed -E 's/-(.)/\u\1/g')
        if [ "$filename" != "$newname" ]; then
            mv "components/ui/$filename" "components/ui/$newname"
        fi
    done
}

# Run the function
echo "Fixing TypeScript errors..."
fix_typescript_errors

echo "Done!" 