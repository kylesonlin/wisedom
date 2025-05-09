import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Grid,
  Pagination,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  Security as SecurityIcon,
  Warning as WarningIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { securityMonitoring } from '../services/security-monitoring';
import { formatDistanceToNow } from 'date-fns';

interface SecurityEvent {
  id: string;
  userId: string;
  type: 'login' | 'logout' | 'password_change' | 'permission_change';
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: Record<string, unknown>;
  ip: string;
  userAgent: string;
  createdAt: string;
}

interface SecurityAlert {
  id: string;
  eventId: string;
  type: 'suspicious_activity' | 'failed_login' | 'rate_limit' | 'permission_change';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'resolved' | 'investigating';
  details: Record<string, unknown>;
  createdAt: string;
  resolvedAt?: string;
}

type EventType = SecurityEvent['type'];
type EventSeverity = SecurityEvent['severity'];
type AlertType = SecurityAlert['type'];
type AlertSeverity = SecurityAlert['severity'];
type AlertStatus = SecurityAlert['status'];

const severityColors = {
  low: 'success',
  medium: 'warning',
  high: 'error',
  critical: 'error',
} as const;

const statusColors = {
  active: 'error',
  investigating: 'warning',
  resolved: 'success',
} as const;

export default function SecurityDashboard() {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [eventPage, setEventPage] = useState(1);
  const [alertPage, setAlertPage] = useState(1);
  const [eventTotal, setEventTotal] = useState(0);
  const [alertTotal, setAlertTotal] = useState(0);
  const [eventFilters, setEventFilters] = useState<{
    type: EventType | '';
    severity: EventSeverity | '';
  }>({
    type: '',
    severity: '',
  });
  const [alertFilters, setAlertFilters] = useState<{
    type: AlertType | '';
    severity: AlertSeverity | '';
    status: AlertStatus | '';
  }>({
    type: '',
    severity: '',
    status: '',
  });
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportType, setExportType] = useState<'events' | 'alerts'>('events');
  const [exportDateRange, setExportDateRange] = useState({
    startDate: '',
    endDate: '',
  });

  const fetchEvents = async () => {
    try {
      const { events, total } = await securityMonitoring.getEvents(
        {
          type: eventFilters.type || undefined,
          severity: eventFilters.severity || undefined,
        },
        eventPage
      );
      setEvents(events);
      setEventTotal(total);
    } catch (error) {
      console.error('Failed to fetch security events:', error);
    }
  };

  const fetchAlerts = async () => {
    try {
      const { alerts, total } = await securityMonitoring.getAlerts(
        {
          type: alertFilters.type || undefined,
          severity: alertFilters.severity || undefined,
          status: alertFilters.status || undefined,
        },
        alertPage
      );
      setAlerts(alerts);
      setAlertTotal(total);
    } catch (error) {
      console.error('Failed to fetch security alerts:', error);
    }
  };

  useEffect(() => {
    fetchEvents();
    fetchAlerts();
  }, [eventPage, alertPage, eventFilters, alertFilters]);

  const handleEventFilterChange = (field: keyof typeof eventFilters, value: string) => {
    setEventFilters((prev) => ({ ...prev, [field]: value }));
    setEventPage(1);
  };

  const handleAlertFilterChange = (field: keyof typeof alertFilters, value: string) => {
    setAlertFilters((prev) => ({ ...prev, [field]: value }));
    setAlertPage(1);
  };

  const handleExport = async () => {
    try {
      let data;
      if (exportType === 'events') {
        const eventType = eventFilters.type === '' ? undefined : eventFilters.type as EventType;
        const eventSeverity = eventFilters.severity === '' ? undefined : eventFilters.severity as EventSeverity;
        
        data = await securityMonitoring.exportEvents({
          type: eventType,
          severity: eventSeverity,
          startDate: exportDateRange.startDate || undefined,
          endDate: exportDateRange.endDate || undefined,
        });
      } else {
        const alertType = alertFilters.type === '' ? undefined : alertFilters.type as AlertType;
        const alertSeverity = alertFilters.severity === '' ? undefined : alertFilters.severity as AlertSeverity;
        const alertStatus = alertFilters.status === '' ? undefined : alertFilters.status as AlertStatus;
        
        data = await securityMonitoring.exportAlerts({
          type: alertType,
          severity: alertSeverity,
          status: alertStatus,
          startDate: exportDateRange.startDate || undefined,
          endDate: exportDateRange.endDate || undefined,
        });
      }

      // Convert data to CSV
      const headers = Object.keys(data[0] || {});
      const csvContent = [
        headers.join(','),
        ...data.map(row => 
          headers.map(header => {
            const value = (row as unknown as Record<string, unknown>)[header];
            return JSON.stringify(value);
          }).join(',')
        )
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${exportType}_export_${new Date().toISOString()}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Export failed:', error);
      // You might want to show an error message to the user here
    }
    setExportDialogOpen(false);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Security Dashboard
        </Typography>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={() => setExportDialogOpen(true)}
        >
          Export Data
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Security Events */}
        <Grid sx={{ width: '100%' }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <SecurityIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Security Events</Typography>
                <Box sx={{ flexGrow: 1 }} />
                <Tooltip title="Refresh">
                  <IconButton onClick={fetchEvents}>
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Grid container spacing={2}>
                  <Grid sx={{ width: { xs: '100%', sm: '50%', md: '25%' } }}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Type</InputLabel>
                      <Select
                        value={eventFilters.type}
                        label="Type"
                        onChange={(e: SelectChangeEvent) => handleEventFilterChange('type', e.target.value)}
                      >
                        <MenuItem value="">All</MenuItem>
                        <MenuItem value="login">Login</MenuItem>
                        <MenuItem value="logout">Logout</MenuItem>
                        <MenuItem value="password_change">Password Change</MenuItem>
                        <MenuItem value="permission_change">Permission Change</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid sx={{ width: { xs: '100%', sm: '50%', md: '25%' } }}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Severity</InputLabel>
                      <Select
                        value={eventFilters.severity}
                        label="Severity"
                        onChange={(e: SelectChangeEvent) => handleEventFilterChange('severity', e.target.value)}
                      >
                        <MenuItem value="">All</MenuItem>
                        <MenuItem value="low">Low</MenuItem>
                        <MenuItem value="medium">Medium</MenuItem>
                        <MenuItem value="high">High</MenuItem>
                        <MenuItem value="critical">Critical</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </Box>

              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Type</TableCell>
                      <TableCell>Severity</TableCell>
                      <TableCell>IP Address</TableCell>
                      <TableCell>User Agent</TableCell>
                      <TableCell>Time</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {events.map((event) => (
                      <TableRow key={event.id}>
                        <TableCell>{event.type}</TableCell>
                        <TableCell>
                          <Chip
                            label={event.severity}
                            color={severityColors[event.severity]}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{event.ip}</TableCell>
                        <TableCell>{event.userAgent}</TableCell>
                        <TableCell>
                          {formatDistanceToNow(new Date(event.createdAt), {
                            addSuffix: true,
                          })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Pagination
                  count={Math.ceil(eventTotal / 50)}
                  page={eventPage}
                  onChange={(_: React.ChangeEvent<unknown>, page: number) => setEventPage(page)}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Security Alerts */}
        <Grid sx={{ width: '100%' }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <WarningIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Security Alerts</Typography>
                <Box sx={{ flexGrow: 1 }} />
                <Tooltip title="Refresh">
                  <IconButton onClick={fetchAlerts}>
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Grid container spacing={2}>
                  <Grid sx={{ width: { xs: '100%', sm: '50%', md: '25%' } }}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Type</InputLabel>
                      <Select
                        value={alertFilters.type}
                        label="Type"
                        onChange={(e: SelectChangeEvent) => handleAlertFilterChange('type', e.target.value)}
                      >
                        <MenuItem value="">All</MenuItem>
                        <MenuItem value="suspicious_activity">Suspicious Activity</MenuItem>
                        <MenuItem value="failed_login">Failed Login</MenuItem>
                        <MenuItem value="rate_limit">Rate Limit</MenuItem>
                        <MenuItem value="permission_change">Permission Change</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid sx={{ width: { xs: '100%', sm: '50%', md: '25%' } }}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Severity</InputLabel>
                      <Select
                        value={alertFilters.severity}
                        label="Severity"
                        onChange={(e: SelectChangeEvent) => handleAlertFilterChange('severity', e.target.value)}
                      >
                        <MenuItem value="">All</MenuItem>
                        <MenuItem value="low">Low</MenuItem>
                        <MenuItem value="medium">Medium</MenuItem>
                        <MenuItem value="high">High</MenuItem>
                        <MenuItem value="critical">Critical</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid sx={{ width: { xs: '100%', sm: '50%', md: '25%' } }}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={alertFilters.status}
                        label="Status"
                        onChange={(e: SelectChangeEvent) => handleAlertFilterChange('status', e.target.value)}
                      >
                        <MenuItem value="">All</MenuItem>
                        <MenuItem value="active">Active</MenuItem>
                        <MenuItem value="investigating">Investigating</MenuItem>
                        <MenuItem value="resolved">Resolved</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </Box>

              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Type</TableCell>
                      <TableCell>Severity</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Time</TableCell>
                      <TableCell>Resolved</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {alerts.map((alert) => (
                      <TableRow key={alert.id}>
                        <TableCell>{alert.type}</TableCell>
                        <TableCell>
                          <Chip
                            label={alert.severity}
                            color={severityColors[alert.severity]}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={alert.status}
                            color={statusColors[alert.status]}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {formatDistanceToNow(new Date(alert.createdAt), {
                            addSuffix: true,
                          })}
                        </TableCell>
                        <TableCell>
                          {alert.resolvedAt
                            ? formatDistanceToNow(new Date(alert.resolvedAt), {
                                addSuffix: true,
                              })
                            : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Pagination
                  count={Math.ceil(alertTotal / 50)}
                  page={alertPage}
                  onChange={(_: React.ChangeEvent<unknown>, page: number) => setAlertPage(page)}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Dialog open={exportDialogOpen} onClose={() => setExportDialogOpen(false)}>
        <DialogTitle>Export Security Data</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Export Type</InputLabel>
              <Select
                value={exportType}
                label="Export Type"
                onChange={(e) => setExportType(e.target.value as 'events' | 'alerts')}
              >
                <MenuItem value="events">Security Events</MenuItem>
                <MenuItem value="alerts">Security Alerts</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Start Date"
              type="date"
              value={exportDateRange.startDate}
              onChange={(e) => setExportDateRange(prev => ({ ...prev, startDate: e.target.value }))}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="End Date"
              type="date"
              value={exportDateRange.endDate}
              onChange={(e) => setExportDateRange(prev => ({ ...prev, endDate: e.target.value }))}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExportDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleExport} variant="contained">
            Export
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 