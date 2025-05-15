"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Box, CssBaseline, AppBar, Toolbar, Typography, List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  Settings as SettingsIcon,
  Security as SecurityIcon,
  History as HistoryIcon,
  Home as HomeIcon,
  Task as TaskIcon,
  Folder as FolderIcon,
} from '@mui/icons-material';
import { SecurityNotifications } from '@/components/SecurityNotifications';
import { getSupabaseClient } from '../utils/supabase';

const supabase = getSupabaseClient();

interface MenuItem {
  text: string;
  icon: React.ReactNode;
  href: string;
}

const menuItems: MenuItem[] = [
  {
    text: 'Dashboard',
    icon: <HomeIcon />,
    href: '/'
  },
  {
    text: 'Contacts',
    icon: <PeopleIcon />,
    href: '/contacts'
  },
  {
    text: 'Tasks',
    icon: <TaskIcon />,
    href: '/tasks'
  },
  {
    text: 'Projects',
    icon: <FolderIcon />,
    href: '/projects'
  },
  {
    text: 'Security',
    icon: <SecurityIcon />,
    href: '/security'
  },
  {
    text: 'Audit Logs',
    icon: <HistoryIcon />,
    href: '/audit'
  },
  {
    text: 'Settings',
    icon: <SettingsIcon />,
    href: '/settings'
  }
];

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
      } else {
        setIsLoading(false);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.push('/login');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  const handleNavigation = (href: string) => {
    router.push(href);
  };

  if (isLoading) {
    return null;
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            RelationshipOS
          </Typography>
          <SecurityNotifications />
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{
          width: 240,
          flexShrink: 0,
          borderRight: '1px solid rgba(0, 0, 0, 0.12)',
          height: '100vh',
          position: 'fixed',
          overflowY: 'auto',
          bgcolor: 'background.paper'
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            PRM Tool
          </Typography>
        </Box>
        <List>
          {menuItems.map((item) => (
            <ListItemButton
              key={item.text}
              onClick={() => handleNavigation(item.href)}
              selected={router.pathname === item.href}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: 'action.selected',
                },
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          ))}
        </List>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          ml: '240px',
          minHeight: '100vh',
          bgcolor: 'background.default'
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default MainLayout; 