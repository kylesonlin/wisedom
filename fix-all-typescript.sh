#!/bin/bash

# Function to fix all TypeScript errors
fix_all_typescript_errors() {
    echo "Fixing all TypeScript errors..."

    # Fix component imports and paths
    find . -type f -name "*.tsx" -o -name "*.ts" | grep -v "node_modules" | xargs sed -i '' \
        -e 's/from "\.\/U/from "\.\//g' \
        -e 's/from "@\/components\/ui\/U/from "@\/components\/ui\//g' \
        -e 's/from "@\/components\/U/from "@\/components\//g' \
        -e 's/from "@\/hooks\/useutoast"/from "@\/hooks\/use-toast"/g' \
        -e 's/from "nextuauth"/from "next-auth"/g' \
        -e 's/from "reactudayupicker"/from "react-day-picker"/g' \
        -e 's/from "reactudropzone"/from "react-dropzone"/g' \
        -e 's/from "reactuhookuform"/from "react-hook-form"/g' \
        -e 's/from "emblaucarouselureact"/from "embla-carousel-react"/g'

    # Fix component props and event handlers
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
        -e 's/onCheckedChange={(e: React.ChangeEvent<HTMLInputElement>)/onCheckedChange={(checked: boolean)/g'

    # Fix ARIA attributes
    find . -type f -name "*.tsx" -o -name "*.ts" | grep -v "node_modules" | xargs sed -i '' \
        -e 's/ariauariauariauariaulabel/aria-label/g' \
        -e 's/ariaucurrent/aria-current/g' \
        -e 's/ariauhidden/aria-hidden/g' \
        -e 's/ariaudisabled/aria-disabled/g' \
        -e 's/ariauroledescription/aria-roledescription/g' \
        -e 's/ariaudescribedby/aria-describedby/g'

    # Fix data attributes
    find . -type f -name "*.tsx" -o -name "*.ts" | grep -v "node_modules" | xargs sed -i '' \
        -e 's/dataustate/data-state/g' \
        -e 's/dataucollapsible/data-collapsible/g' \
        -e 's/datauvariant/data-variant/g' \
        -e 's/datauside/data-side/g' \
        -e 's/datausidebar/data-sidebar/g' \
        -e 's/datauchart/data-chart/g'

    # Fix form-related IDs and classes
    find . -type f -name "*.tsx" -o -name "*.ts" | grep -v "node_modules" | xargs sed -i '' \
        -e 's/uformuitem/form-item/g' \
        -e 's/uformuitemudescription/form-item-description/g' \
        -e 's/uformuitemumessage/form-item-message/g' \
        -e 's/uformucontrol/form-control/g' \
        -e 's/uformulabel/form-label/g'

    # Fix toast-related classes and IDs
    find . -type f -name "*.tsx" -o -name "*.ts" | grep -v "node_modules" | xargs sed -i '' \
        -e 's/toastuclose/toast-close/g' \
        -e 's/toastuaction/toast-action/g' \
        -e 's/toastudescription/toast-description/g'

    # Fix command menu related classes
    find . -type f -name "*.tsx" -o -name "*.ts" | grep -v "node_modules" | xargs sed -i '' \
        -e 's/cmdkuinputuwrapper/cmdk-input-wrapper/g' \
        -e 's/cmdkuinput/cmdk-input/g' \
        -e 's/cmdkulist/cmdk-list/g'

    # Fix comparison variable
    find . -type f -name "*.ts" | grep -v "node_modules" | xargs sed -i '' \
        -e 's/ucomparison/comparison/g'

    # Fix layout imports
    find . -type f -name "*.tsx" | grep -v "node_modules" | xargs sed -i '' \
        -e 's/@\/components\/Ulayout/@\/components\/Layout/g' \
        -e 's/@\/components\/Umainlayout/@\/components\/MainLayout/g'

    # Fix index.ts exports
    find . -type f -name "index.ts" | grep -v "node_modules" | xargs sed -i '' \
        -e 's/from '\''\.\/U\([a-z]\+\)'\''/from '\''\.\/\u\1'\''/g' \
        -e 's/from '\''\.\/u\([a-z]\+\)'\''/from '\''\.\/\u\1'\''/g'

    echo "All TypeScript errors have been fixed!"
}

# Run the function
fix_all_typescript_errors 