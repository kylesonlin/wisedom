#!/bin/bash

# Function to fix TypeScript errors
fix_typescript_errors() {
    # Fix aria attributes
    find . -type f -name "*.tsx" -o -name "*.ts" | grep -v "node_modules" | xargs sed -i '' \
        -e 's/ariauariauariauariaulabel/aria-label/g' \
        -e 's/ariaucurrent/aria-current/g' \
        -e 's/ariauhidden/aria-hidden/g' \
        -e 's/ariaudisabled/aria-disabled/g' \
        -e 's/ariauroledescription/aria-roledescription/g' \
        -e 's/ariaudescribedby/aria-describedby/g' \
        -e 's/toastuclose/toast-close/g' \
        -e 's/cmdkuinputuwrapper/cmdk-input-wrapper/g'

    # Fix data attributes
    find . -type f -name "*.tsx" -o -name "*.ts" | grep -v "node_modules" | xargs sed -i '' \
        -e 's/dataustate/data-state/g' \
        -e 's/dataucollapsible/data-collapsible/g' \
        -e 's/datauvariant/data-variant/g' \
        -e 's/datauside/data-side/g' \
        -e 's/datausidebar/data-sidebar/g' \
        -e 's/datauchart/data-chart/g'

    # Fix import paths
    find . -type f -name "*.tsx" -o -name "*.ts" | grep -v "node_modules" | xargs sed -i '' \
        -e 's/from "\.\/U/from "\.\//g' \
        -e 's/from "@\/components\/ui\/U/from "@\/components\/ui\//g' \
        -e 's/from "@\/hooks\/useutoast"/from "@\/hooks\/use-toast"/g' \
        -e 's/from "nextuauth"/from "next-auth"/g' \
        -e 's/from "nextuauth\/providers\/google"/from "next-auth\/providers\/google"/g' \
        -e 's/from "reactudayupicker"/from "react-day-picker"/g' \
        -e 's/from "reactudropzone"/from "react-dropzone"/g' \
        -e 's/from "reactuhookuform"/from "react-hook-form"/g' \
        -e 's/from "emblaucarouselureact"/from "embla-carousel-react"/g'

    # Fix comparison variable
    find . -type f -name "*.ts" | grep -v "node_modules" | xargs sed -i '' \
        -e 's/ucomparison/comparison/g'
}

# Run the function
echo "Fixing TypeScript errors..."
fix_typescript_errors

echo "Done!" 