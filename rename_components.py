#!/usr/bin/env python3
import os
import re

def normalize_component_name(filename):
    # Remove .tsx extension
    name = os.path.splitext(filename)[0]
    
    # Convert to lowercase first
    name = name.lower()
    
    # Remove prefixes
    name = re.sub(r'^[lu]+', '', name)
    name = re.sub(r'^u', '', name)
    
    # Split on special characters and 'u' between words
    parts = re.split(r'[-u_]', name)
    
    # Clean up parts and capitalize each one
    parts = [part.strip() for part in parts if part.strip()]
    parts = [part[0].upper() + part[1:] if part else '' for part in parts]
    
    # Special cases for common component names
    name_map = {
        'Btn': 'Button',
        'Inpt': 'Input',
        'Txt': 'Text',
        'Grp': 'Group',
        'Sel': 'Select',
        'Nav': 'Navigation',
        'Dlg': 'Dialog',
        'Tgl': 'Toggle',
        'Chk': 'Checkbox',
        'Rad': 'Radio',
        'Scrl': 'Scroll',
        'Mnu': 'Menu',
        'Frm': 'Form',
        'Lbl': 'Label',
        'Icn': 'Icon',
        'Img': 'Image',
        'Btn': 'Button',
        'Drp': 'Drop',
        'Dwn': 'Down',
        'Mb': 'Menu',
        'Otp': 'OTP',
        'Men': 'Menu',
    }
    
    # Replace abbreviated parts with full names
    parts = [name_map.get(part, part) for part in parts]
    
    # Join back together and add extension
    return ''.join(parts) + '.tsx'

def rename_components():
    ui_dir = 'components/ui'
    
    # Ensure the directory exists
    os.makedirs(ui_dir, exist_ok=True)
    
    # Get all .tsx files
    files = [f for f in os.listdir(ui_dir) if f.endswith('.tsx') or f.endswith('.TSX')]
    
    # Process each file
    for old_name in files:
        new_name = normalize_component_name(old_name)
        old_path = os.path.join(ui_dir, old_name)
        new_path = os.path.join(ui_dir, new_name)
        
        try:
            os.rename(old_path, new_path)
            print(f'Renamed: {old_name} -> {new_name}')
        except OSError as e:
            print(f'Error renaming {old_name}: {e}')

if __name__ == '__main__':
    rename_components() 