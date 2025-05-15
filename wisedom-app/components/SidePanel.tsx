"use client";
import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Logout as LogoutIcon } from '@mui/icons-material';
import { getSupabaseClient } from '../utils/supabase';

interface MenuItem {
  text: string;
  icon: React.ReactNode;
  href: string;
}

interface SidePanelProps {
  menuItems: MenuItem[];
}

const SidePanel: React.FC<SidePanelProps> = ({ menuItems }) => {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = getSupabaseClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <Box
      sx={{
        width: 240,
        flexShrink: 0,
        borderRight: 1,
        borderColor: 'divider',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <List sx={{ flexGrow: 1 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={pathname === item.href}
              onClick={() => router.push(item.href)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <Box sx={{ p: 1 }}>
        <Tooltip title="Logout">
          <IconButton onClick={handleLogout} color="inherit">
            <LogoutIcon />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
};

export default SidePanel; 