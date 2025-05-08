#!/bin/bash

# Function to fix component names and imports
fix_component_names() {
    echo "Fixing component names and imports..."

    # Move to the app/components/ui directory
    cd app/components/ui

    # Rename files from L prefix to standard names
    for file in L*.tsx; do
        if [ -f "$file" ]; then
            newname="${file#L}"
            mv "$file" "$newname"
            echo "Renamed $file to $newname"
        fi
    done

    # Update imports in index.tsx
    cat > index.tsx << 'EOL'
export { Button, buttonVariants } from './BUTTON';
export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './CARD';
export { Input } from './INPUT';
export { Badge, badgeVariants } from './BADGE';
export { Modal, ModalContent, ModalFooter } from './MODAL';
export { Select } from './SELECT';
export { Checkbox } from './CHECKBOX';
export { Radio } from './RADIO';
export { Textarea } from './TEXTAREA';
export { FormDatePicker } from './FORMDATEPICKER';
export { FileUpload } from './FILEUPLOAD';
export { Tabs, TabsList, TabsTrigger, TabsContent } from './TABS';
export { Avatar, AvatarFallback, AvatarImage } from './AVATAR';
export { Progress } from './PROGRESS';
export { Calendar } from './CALENDAR';
export { Separator } from './SEPARATOR';
export { Sheet, SheetContent } from './SHEET';
export { Skeleton } from './SKELETON';
export { ScrollArea } from './SCROLLAREA';
export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './TOOLTIP';
export { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './DROPDOWNMENU';
EOL

    # Update imports in use-toast.tsx
    sed -i '' 's/@\/components\/ui\/oast/@\/components\/ui\/TOAST/g' use-toast.tsx

    # Go back to the root directory
    cd ../../..

    # Update imports in other files
    find . -type f -name "*.tsx" -o -name "*.ts" | grep -v "node_modules" | xargs sed -i '' \
        -e 's/from "\.\/tton"/from "\.\/BUTTON"/g' \
        -e 's/from "\.\/put"/from "\.\/INPUT"/g' \
        -e 's/from "\.\/eparator"/from "\.\/SEPARATOR"/g' \
        -e 's/from "\.\/heet"/from "\.\/SHEET"/g' \
        -e 's/from "\.\/keleton"/from "\.\/SKELETON"/g' \
        -e 's/from "\.\/crollarea"/from "\.\/SCROLLAREA"/g' \
        -e 's/from "\.\/ooltip"/from "\.\/TOOLTIP"/g' \
        -e 's/from "\.\/ggle"/from "\.\/TOGGLE"/g' \
        -e 's/from "@\/components\/ui\/oast"/from "@\/components\/ui\/TOAST"/g' \
        -e 's/from "@\/components\/ui\/ialog"/from "@\/components\/ui\/DIALOG"/g' \
        -e 's/from "@\/components\/ui\/abel"/from "@\/components\/ui\/LABEL"/g'

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
        -e 's/size="default" {...props}/...props/g'

    echo "Component names and imports have been fixed!"
}

# Run the function
fix_component_names 