#!/bin/bash

# Function to fix final component import issues
fix_final_component_imports() {
    echo "Fixing final component import issues..."

    # Rename files in app/components/ui
    cd app/components/ui
    for file in L*.tsx; do
        if [ -f "$file" ]; then
            newname="${file#L}"
            newname="${newname%.tsx}.tsx"
            mv "$file" "$newname"
            echo "Renamed $file to $newname"
        fi
    done

    # Update index.tsx imports
    cat > index.tsx << 'EOL'
export { Button, buttonVariants } from './button';
export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card';
export { Input } from './input';
export { Badge, badgeVariants } from './badge';
export { Modal, ModalContent, ModalFooter } from './modal';
export { Select } from './select';
export { Checkbox } from './checkbox';
export { Radio } from './radio';
export { Textarea } from './textarea';
export { FormDatePicker } from './form-date-picker';
export { FileUpload } from './file-upload';
export { Tabs, TabsList, TabsTrigger, TabsContent } from './tabs';
export { Avatar, AvatarFallback, AvatarImage } from './avatar';
export { Progress } from './progress';
export { Calendar } from './calendar';
export { Separator } from './separator';
export { Sheet, SheetContent } from './sheet';
export { Skeleton } from './skeleton';
export { ScrollArea } from './scroll-area';
export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip';
export { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './dropdown-menu';
EOL

    cd ../../..

    # Copy files to components/ui
    cp -r app/components/ui/* components/ui/

    # Update imports in all files
    find . -type f -name "*.tsx" -o -name "*.ts" | grep -v "node_modules" | xargs sed -i '' \
        -e 's/from "\.\/Button"/from "@\/components\/ui\/button"/g' \
        -e 's/from "\.\/Card"/from "@\/components\/ui\/card"/g' \
        -e 's/from "\.\/Input"/from "@\/components\/ui\/input"/g' \
        -e 's/from "\.\/Badge"/from "@\/components\/ui\/badge"/g' \
        -e 's/from "\.\/Modal"/from "@\/components\/ui\/modal"/g' \
        -e 's/from "\.\/Select"/from "@\/components\/ui\/select"/g' \
        -e 's/from "\.\/Checkbox"/from "@\/components\/ui\/checkbox"/g' \
        -e 's/from "\.\/Radio"/from "@\/components\/ui\/radio"/g' \
        -e 's/from "\.\/Textarea"/from "@\/components\/ui\/textarea"/g' \
        -e 's/from "\.\/FormDatePicker"/from "@\/components\/ui\/form-date-picker"/g' \
        -e 's/from "\.\/FileUpload"/from "@\/components\/ui\/file-upload"/g' \
        -e 's/from "\.\/Tabs"/from "@\/components\/ui\/tabs"/g' \
        -e 's/from "\.\/Avatar"/from "@\/components\/ui\/avatar"/g' \
        -e 's/from "\.\/Progress"/from "@\/components\/ui\/progress"/g' \
        -e 's/from "\.\/Calendar"/from "@\/components\/ui\/calendar"/g' \
        -e 's/from "\.\/Separator"/from "@\/components\/ui\/separator"/g' \
        -e 's/from "\.\/Sheet"/from "@\/components\/ui\/sheet"/g' \
        -e 's/from "\.\/Skeleton"/from "@\/components\/ui\/skeleton"/g' \
        -e 's/from "\.\/ScrollArea"/from "@\/components\/ui\/scroll-area"/g' \
        -e 's/from "\.\/Tooltip"/from "@\/components\/ui\/tooltip"/g' \
        -e 's/from "\.\/DropdownMenu"/from "@\/components\/ui\/dropdown-menu"/g' \
        -e 's/from "\.\/Toast"/from "@\/components\/ui\/toast"/g' \
        -e 's/from "\.\/Dialog"/from "@\/components\/ui\/dialog"/g' \
        -e 's/from "\.\/Label"/from "@\/components\/ui\/label"/g' \
        -e 's/from "\.\/Popover"/from "@\/components\/ui\/popover"/g' \
        -e 's/from "\.\/Toggle"/from "@\/components\/ui\/toggle"/g' \
        -e 's/from "\.\/ToggleGroup"/from "@\/components\/ui\/toggle-group"/g' \
        -e 's/from "\.\/Toaster"/from "@\/components\/ui\/toaster"/g' \
        -e 's/from "@\/components\/ui\/Toast"/from "@\/components\/ui\/toast"/g' \
        -e 's/from "@\/components\/ui\/Button"/from "@\/components\/ui\/button"/g' \
        -e 's/from "@\/components\/ui\/Card"/from "@\/components\/ui\/card"/g' \
        -e 's/from "@\/components\/ui\/Input"/from "@\/components\/ui\/input"/g' \
        -e 's/from "@\/components\/ui\/Badge"/from "@\/components\/ui\/badge"/g' \
        -e 's/from "@\/components\/ui\/Modal"/from "@\/components\/ui\/modal"/g' \
        -e 's/from "@\/components\/ui\/Select"/from "@\/components\/ui\/select"/g' \
        -e 's/from "@\/components\/ui\/Checkbox"/from "@\/components\/ui\/checkbox"/g' \
        -e 's/from "@\/components\/ui\/Radio"/from "@\/components\/ui\/radio"/g' \
        -e 's/from "@\/components\/ui\/Textarea"/from "@\/components\/ui\/textarea"/g' \
        -e 's/from "@\/components\/ui\/FormDatePicker"/from "@\/components\/ui\/form-date-picker"/g' \
        -e 's/from "@\/components\/ui\/FileUpload"/from "@\/components\/ui\/file-upload"/g' \
        -e 's/from "@\/components\/ui\/Tabs"/from "@\/components\/ui\/tabs"/g' \
        -e 's/from "@\/components\/ui\/Avatar"/from "@\/components\/ui\/avatar"/g' \
        -e 's/from "@\/components\/ui\/Progress"/from "@\/components\/ui\/progress"/g' \
        -e 's/from "@\/components\/ui\/Calendar"/from "@\/components\/ui\/calendar"/g' \
        -e 's/from "@\/components\/ui\/Separator"/from "@\/components\/ui\/separator"/g' \
        -e 's/from "@\/components\/ui\/Sheet"/from "@\/components\/ui\/sheet"/g' \
        -e 's/from "@\/components\/ui\/Skeleton"/from "@\/components\/ui\/skeleton"/g' \
        -e 's/from "@\/components\/ui\/ScrollArea"/from "@\/components\/ui\/scroll-area"/g' \
        -e 's/from "@\/components\/ui\/Tooltip"/from "@\/components\/ui\/tooltip"/g' \
        -e 's/from "@\/components\/ui\/DropdownMenu"/from "@\/components\/ui\/dropdown-menu"/g' \
        -e 's/from "@\/components\/ui\/Dialog"/from "@\/components\/ui\/dialog"/g' \
        -e 's/from "@\/components\/ui\/Label"/from "@\/components\/ui\/label"/g' \
        -e 's/from "@\/components\/ui\/Popover"/from "@\/components\/ui\/popover"/g' \
        -e 's/from "@\/components\/ui\/Toggle"/from "@\/components\/ui\/toggle"/g' \
        -e 's/from "@\/components\/ui\/ToggleGroup"/from "@\/components\/ui\/toggle-group"/g' \
        -e 's/from "@\/components\/ui\/Toaster"/from "@\/components\/ui\/toaster"/g'

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
        -e 's/data-label="Toggle Sidebar"/aria-label="Toggle Sidebar"/g'

    echo "Final component import issues have been fixed!"
}

# Run the function
fix_final_component_imports 