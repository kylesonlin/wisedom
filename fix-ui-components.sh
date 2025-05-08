#!/bin/bash

# Function to rename UI component files
rename_components() {
    # Create components/ui directory if it doesn't exist
    mkdir -p components/ui

    # First, rename all files to lowercase
    for file in components/ui/*.tsx components/ui/*.TSX; do
        if [ -f "$file" ]; then
            dirname=$(dirname "$file")
            basename=$(basename "$file")
            lowercase=$(echo "$basename" | tr '[:upper:]' '[:lower:]')
            mv "$file" "$dirname/$lowercase" 2>/dev/null || true
        fi
    done

    # Then fix the casing and remove prefixes
    for file in components/ui/*.tsx; do
        if [ -f "$file" ]; then
            # Get the base name without extension
            basename=$(basename "$file" .tsx)
            
            # Remove all prefixes (l, lu, u) and fix casing
            newname=$(echo "$basename" | sed -E 's/^[lu]+//g' | sed -E 's/^u//g' | sed -E 's/^./\U&/g' | sed -E 's/-(.)/\U\1/g' | sed -E 's/u([a-z])/\U\1/g')
            
            # Add back the extension
            newname="$newname.tsx"
            
            # Move the file
            mv "components/ui/$basename.tsx" "components/ui/$newname" 2>/dev/null || true
        fi
    done
}

# Function to fix imports in all TypeScript files
fix_imports() {
    find . -type f -name "*.tsx" -o -name "*.ts" | grep -v "node_modules" | xargs sed -i '' \
        -e 's/from "[\.\/]*components\/ui\/[LlUu]\([A-Za-z]\+\)"/from "@\/components\/ui\/\u\1"/g' \
        -e 's/from "[\.\/]*components\/ui\/[LlUu][LlUu]\([A-Za-z]\+\)"/from "@\/components\/ui\/\u\1"/g' \
        -e 's/-\([a-z]\)/\u\1/g'
}

# Function to update index.ts exports
update_index() {
    cat > components/ui/index.ts << 'EOL'
export { Button, buttonVariants } from './Button';
export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './Card';
export { Input } from './Input';
export { Badge, badgeVariants } from './Badge';
export { Modal, ModalContent, ModalFooter } from './Modal';
export { Select, SelectGroup, SelectValue, SelectTrigger, SelectContent, SelectLabel, SelectItem, SelectSeparator } from './Select';
export { Checkbox } from './Checkbox';
export { Radio } from './Radio';
export { Textarea } from './Textarea';
export { FormDatePicker } from './FormDatePicker';
export { FileUpload } from './FileUpload';
export { Tabs, TabsList, TabsTrigger, TabsContent } from './Tabs';
export { Avatar, AvatarFallback, AvatarImage } from './Avatar';
export { Progress } from './Progress';
export { Calendar } from './Calendar';
export { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './Dialog';
export { Label } from './Label';
export { Popover, PopoverContent, PopoverTrigger } from './Popover';
export { Toggle, toggleVariants } from './Toggle';
export { ToggleGroup, toggleGroupVariants } from './ToggleGroup';
export { Toast, ToastAction } from './Toast';
export { Toaster } from './Toaster';
export { Skeleton } from './Skeleton';
export { ScrollArea } from './ScrollArea';
export { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetFooter, SheetTitle, SheetDescription } from './Sheet';
export { Separator } from './Separator';
EOL
}

# Run the functions
echo "Renaming UI components..."
rename_components

echo "Fixing imports..."
fix_imports

echo "Updating index.ts..."
update_index

echo "Done!" 