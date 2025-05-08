#!/bin/bash

# Function to fix imports in a file
fix_imports() {
  local file="$1"
  
  # Update component imports
  sed -i '' 's|@/components/ui/[A-Z]|@/components/ui/\L&|g' "$file"
  sed -i '' 's|"./[A-Z]|"./\L&|g' "$file"
  sed -i '' "s|'./[A-Z]|'./\L&|g" "$file"
  
  # Fix specific component imports
  components=(
    "Button" "Input" "Label" "Textarea" "Checkbox" "RadioGroup" "Switch" "Select" "Slider" "Toggle"
    "Card" "Sheet" "Tabs" "Accordion" "Alert" "AspectRatio" "Avatar" "Badge" "Breadcrumb" "Calendar"
    "Carousel" "Collapsible" "Command" "ContextMenu" "Dialog" "Drawer" "DropdownMenu" "HoverCard"
    "Menubar" "NavigationMenu" "Pagination" "Popover" "Progress" "Resizable" "ScrollArea" "Separator"
    "Skeleton" "Table" "Toast" "Toaster" "Tooltip"
  )
  
  for component in "${components[@]}"; do
    # Convert component name to kebab case
    kebab_case=$(echo "$component" | sed 's/\([A-Z]\)/-\L\1/g' | sed 's/^-//')
    
    # Update imports
    sed -i '' "s|@/components/ui/$component|@/components/ui/$kebab_case|g" "$file"
    sed -i '' "s|\"./ui/$component|\"./ui/$kebab_case|g" "$file"
    sed -i '' "s|'./$component|'./$kebab_case|g" "$file"
  done
}

# Find all TypeScript/React files and fix imports
find . -type f \( -name "*.ts" -o -name "*.tsx" \) -not -path "*/node_modules/*" -exec bash -c 'fix_imports "$0"' {} \;

echo "Done!" 