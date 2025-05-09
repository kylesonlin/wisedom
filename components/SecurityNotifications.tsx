import React, { useEffect, useState } from 'react';
import {
  Box,
  Snackbar,
  Alert,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Warning as WarningIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { securityMonitoring } from '../services/security-monitoring';
import { formatDistanceToNow } from 'date-fns';

interface SecurityNotification {
  id: string;
  type: 'event' | 'alert';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
  read: boolean;
}

export const SecurityNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<SecurityNotification[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [currentNotification, setCurrentNotification] = useState<SecurityNotification | null>(null);

  useEffect(() => {
    // Subscribe to real-time security events
    const subscription = securityMonitoring.subscribeToEvents((event) => {
      const notification: SecurityNotification = {
        id: event.id,
        type: 'event',
        severity: event.severity,
        message: `Security event: ${event.type}`,
        timestamp: event.createdAt,
        read: false,
      };
      addNotification(notification);
    });

    // Subscribe to real-time security alerts
    const alertSubscription = securityMonitoring.subscribeToAlerts((alert) => {
      const notification: SecurityNotification = {
        id: alert.id,
        type: 'alert',
        severity: alert.severity,
        message: `Security alert: ${alert.type}`,
        timestamp: alert.createdAt,
        read: false,
      };
      addNotification(notification);
    });

    return () => {
      subscription.unsubscribe();
      alertSubscription.unsubscribe();
    };
  }, []);

  const addNotification = (notification: SecurityNotification) => {
    setNotifications((prev) => [notification, ...prev].slice(0, 50)); // Keep last 50 notifications
    setCurrentNotification(notification);
    setOpenSnackbar(true);
  };

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSnackbarClose = () => {
    setOpenSnackbar(false);
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, read: true }))
    );
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <>
      <IconButton color="inherit" onClick={handleClick}>
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: { width: 360, maxHeight: 480 },
        }}
      >
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">Security Notifications</Typography>
          {unreadCount > 0 && (
            <IconButton size="small" onClick={markAllAsRead}>
              <CloseIcon />
            </IconButton>
          )}
        </Box>
        <Divider />
        <List sx={{ p: 0 }}>
          {notifications.length === 0 ? (
            <ListItem>
              <ListItemText primary="No notifications" />
            </ListItem>
          ) : (
            notifications.map((notification) => (
              <ListItem
                key={notification.id}
                sx={{
                  bgcolor: notification.read ? 'inherit' : 'action.hover',
                  '&:hover': { bgcolor: 'action.selected' },
                }}
                onClick={() => markAsRead(notification.id)}
              >
                <ListItemIcon>
                  {notification.type === 'event' ? (
                    <SecurityIcon color={notification.severity === 'critical' ? 'error' : 'inherit'} />
                  ) : (
                    <WarningIcon color={notification.severity === 'critical' ? 'error' : 'inherit'} />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={notification.message}
                  secondary={formatDistanceToNow(new Date(notification.timestamp), {
                    addSuffix: true,
                  })}
                />
              </ListItem>
            ))
          )}
        </List>
      </Menu>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={currentNotification?.severity === 'critical' ? 'error' : 'warning'}
          sx={{ width: '100%' }}
        >
          {currentNotification?.message}
        </Alert>
      </Snackbar>
    </>
  );
}; 