#!/bin/bash

# Function to replace old imports with new ones
replace_imports() {
    # Replace U-prefixed component imports and fix casing
    find . -type f -name "*.tsx" -o -name "*.ts" | grep -v "node_modules" | xargs sed -i '' \
        -e 's/@\/components\/ui\/U\([a-z]\+\)/@\/components\/ui\/\u\1/g' \
        -e 's/from "\.\.\/\.\.\/components\/ui\/U\([a-z]\+\)/from "@\/components\/ui\/\u\1/g' \
        -e 's/from "\.\.\/components\/ui\/U\([a-z]\+\)/from "@\/components\/ui\/\u\1/g' \
        -e 's/from "\.\/components\/ui\/U\([a-z]\+\)/from "@\/components\/ui\/\u\1/g' \
        -e 's/@\/components\/ui\/\([a-z]\+\)/@\/components\/ui\/\u\1/g' \
        -e 's/from "\.\.\/\.\.\/components\/ui\/\([a-z]\+\)/from "@\/components\/ui\/\u\1/g' \
        -e 's/from "\.\.\/components\/ui\/\([a-z]\+\)/from "@\/components\/ui\/\u\1/g' \
        -e 's/from "\.\/components\/ui\/\([a-z]\+\)/from "@\/components\/ui\/\u\1/g' \
        -e 's/from "@\/app\/components\/ui/from "@\/components\/ui/g' \
        -e 's/from "@\/enhanced-dashboard\/components\/ui/from "@\/components\/ui/g' \
        -e 's/from "\.\.\/\.\.\/\.\.\/components\/ui/from "@\/components\/ui/g' \
        -e 's/from "\.\.\/\.\.\/components\/ui/from "@\/components\/ui/g' \
        -e 's/from "\.\.\/components\/ui/from "@\/components\/ui/g' \
        -e 's/from "\.\/components\/ui/from "@\/components\/ui/g' \
        -e 's/from "\.\.\/@\/components\/ui/from "@\/components\/ui/g' \
        -e 's/from "\.\/@\/components\/ui/from "@\/components\/ui/g' \
        -e 's/from "\.\/\([A-Z][a-z]\+\)"/from "@\/components\/ui\/\1"/g' \
        -e 's/from "\.\.\/components\/ui\/\([A-Z][a-z]\+\)"/from "@\/components\/ui\/\1"/g' \
        -e 's/from "\.\.\/\.\.\/components\/ui\/\([A-Z][a-z]\+\)"/from "@\/components\/ui\/\1"/g' \
        -e 's/from "\.\.\/\.\.\/\.\.\/components\/ui\/\([A-Z][a-z]\+\)"/from "@\/components\/ui\/\1"/g' \
        -e 's/from "\.\.\/components\/\([A-Z][a-z]\+\)"/from "@\/components\/\1"/g'
}

# Function to fix type declarations
fix_types() {
    # Add type annotations for event handlers
    find . -type f -name "*.tsx" | grep -v "node_modules" | xargs sed -i '' \
        -e 's/onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>/onChange={(e: React.ChangeEvent<HTMLInputElement>) =>/g' \
        -e 's/onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>/onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>/g' \
        -e 's/onClick={(e) =>/onClick={(e: React.MouseEvent<HTMLButtonElement>) =>/g' \
        -e 's/onSubmit={(e) =>/onSubmit={(e: React.FormEvent<HTMLFormElement>) =>/g' \
        -e 's/onOpenChange: (open) =>/onOpenChange: (open: boolean) =>/g' \
        -e 's/onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSearchQuery/onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery/g' \
        -e 's/onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setEmail/onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail/g' \
        -e 's/onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setPassword/onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword/g' \
        -e 's/onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setConfirmPassword/onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword/g' \
        -e 's/onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData/onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData/g' \
        -e 's/onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFeedbackText/onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFeedbackText/g' \
        -e 's/onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedStatus/onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSelectedStatus/g' \
        -e 's/onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSortBy/onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSortBy/g' \
        -e 's/onChange={handleInputChange}/onCheckedChange={handleInputChange}/g' \
        -e 's/onChange={handleNotificationChange}/onCheckedChange={handleNotificationChange}/g' \
        -e 's/onChange={(e: React.ChangeEvent<HTMLInputElement>)/onValueChange={(value: string)/g' \
        -e 's/e.target.value/value/g' \
        -e 's/onClick={(event) =>/onClick={(event: React.MouseEvent<HTMLButtonElement>) =>/g' \
        -e 's/onClick?.(event)/onClick?.(event as React.MouseEvent<HTMLButtonElement>)/g'
}

# Function to fix component references
fix_components() {
    # Replace old component references with standardized names
    find . -type f -name "*.tsx" | grep -v "node_modules" | xargs sed -i '' \
        -e 's/Ubutton/Button/g' \
        -e 's/Ucard/Card/g' \
        -e 's/Uinput/Input/g' \
        -e 's/Ubadge/Badge/g' \
        -e 's/Utabs/Tabs/g' \
        -e 's/Uavatar/Avatar/g' \
        -e 's/Uprogress/Progress/g' \
        -e 's/Uselect/Select/g' \
        -e 's/Umodal/Modal/g' \
        -e 's/Udatepicker/DatePicker/g' \
        -e 's/Ucalendar/Calendar/g' \
        -e 's/Uform/Form/g' \
        -e 's/Utoggle/Toggle/g' \
        -e 's/UtoggleUgroup/ToggleGroup/g' \
        -e 's/Utoast/Toast/g' \
        -e 's/Utoaster/Toaster/g' \
        -e 's/Udialog/Dialog/g' \
        -e 's/Ulabel/Label/g'
}

# Function to move and rename UI components
move_components() {
    # Create components/ui directory if it doesn't exist
    mkdir -p components/ui

    # Move components from app/components/ui to components/ui
    cp -r app/components/ui/* components/ui/ 2>/dev/null || true
    
    # Move components from enhanced-dashboard/components/ui to components/ui
    cp -r enhanced-dashboard/components/ui/* components/ui/ 2>/dev/null || true

    # Rename U-prefixed files
    for file in components/ui/U*.tsx; do
        if [ -f "$file" ]; then
            newname=$(echo "$file" | sed 's/U\([a-z]\)/\u\1/')
            mv "$file" "$newname" 2>/dev/null || true
        fi
    done

    # Fix casing of component files
    for file in components/ui/*.tsx; do
        if [ -f "$file" ]; then
            basename=$(basename "$file" .tsx)
            newname="components/ui/${basename^}.tsx"
            mv "$file" "$newname" 2>/dev/null || true
        fi
    done

    # Fix casing in imports within component files
    find components/ui -type f -name "*.tsx" | xargs sed -i '' \
        -e 's/from "\.\.\/@\/components\/ui\/\([a-z]\+\)"/from "@\/components\/ui\/\u\1"/g' \
        -e 's/from "\.\.\/@\/components\/ui\/\([A-Z][a-z]\+\)"/from "@\/components\/ui\/\1"/g' \
        -e 's/from "\.\/@\/components\/ui\/\([a-z]\+\)"/from "@\/components\/ui\/\u\1"/g' \
        -e 's/from "\.\/@\/components\/ui\/\([A-Z][a-z]\+\)"/from "@\/components\/ui\/\1"/g' \
        -e 's/from "\.\.\/components\/ui\/\([a-z]\+\)"/from "@\/components\/ui\/\u\1"/g' \
        -e 's/from "\.\.\/components\/ui\/\([A-Z][a-z]\+\)"/from "@\/components\/ui\/\1"/g' \
        -e 's/from "\.\/components\/ui\/\([a-z]\+\)"/from "@\/components\/ui\/\u\1"/g' \
        -e 's/from "\.\/components\/ui\/\([A-Z][a-z]\+\)"/from "@\/components\/ui\/\1"/g'
}

# Function to fix form component props
fix_form_props() {
    find . -type f -name "*.tsx" | grep -v "node_modules" | xargs sed -i '' \
        -e 's/isOpen={/open={/g' \
        -e 's/label="/aria-label="/g' \
        -e 's/error={/data-error={/g' \
        -e 's/onClose={/onOpenChange={/g' \
        -e 's/onClick={(event) =>/onClick={(event: React.MouseEvent) =>/g' \
        -e 's/onChange={(e: React.ChangeEvent<HTMLInputElement>)/onChange={(value: string)/g' \
        -e 's/onChange={(e: React.ChangeEvent<HTMLSelectElement>)/onValueChange={(value: string)/g' \
        -e 's/onChange={(e: React.ChangeEvent<HTMLTextAreaElement>)/onValueChange={(value: string)/g' \
        -e 's/onChange={handleSelectChange}/onValueChange={handleSelectChange}/g' \
        -e 's/onChange={handleInputChange}/onValueChange={handleInputChange}/g' \
        -e 's/onChange={handleNotificationChange}/onValueChange={handleNotificationChange}/g' \
        -e 's/onCheckedChange={(e: React.ChangeEvent<HTMLInputElement>)/onCheckedChange={(checked: boolean)/g' \
        -e 's/onCheckedChange={handleInputChange}/onCheckedChange={(checked: boolean) => handleInputChange({ target: { checked } } as any)}/g' \
        -e 's/onCheckedChange={handleNotificationChange}/onCheckedChange={(checked: boolean) => handleNotificationChange({ target: { checked } } as any)}/g' \
        -e 's/title="/aria-label="/g'
}

# Function to fix layout imports
fix_layout_imports() {
    find . -type f -name "*.tsx" | grep -v "node_modules" | xargs sed -i '' \
        -e 's/@\/components\/Ulayout/@\/components\/Layout/g' \
        -e 's/@\/components\/Umainlayout/@\/components\/MainLayout/g'
}

# Function to fix index.ts exports
fix_index_exports() {
    find . -type f -name "index.ts" | grep -v "node_modules" | xargs sed -i '' \
        -e 's/from '\''\.\/U\([a-z]\+\)'\''/from '\''\.\/\u\1'\''/g' \
        -e 's/from '\''\.\/u\([a-z]\+\)'\''/from '\''\.\/\u\1'\''/g'
}

# Run all fixes
echo "Moving and renaming components..."
move_components

echo "Fixing import paths..."
replace_imports

echo "Fixing type declarations..."
fix_types

echo "Fixing component references..."
fix_components

echo "Fixing form props..."
fix_form_props

echo "Fixing layout imports..."
fix_layout_imports

echo "Fixing index exports..."
fix_index_exports

echo "Done!" 