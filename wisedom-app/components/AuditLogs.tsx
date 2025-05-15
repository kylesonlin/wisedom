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
  History as HistoryIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { auditLogging, AuditAction, AuditResource } from '../services/audit-logging';

interface AuditLog {
  id: string;
  userId: string;
  action: AuditAction;
  resource: AuditResource;
  resourceId?: string;
  details: Record<string, unknown>;
  ip: string;
  userAgent: string;
  createdAt: string;
}

const actionColors: Record<AuditAction, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
  user_create: 'success',
  user_update: 'info',
  user_delete: 'error',
  role_change: 'warning',
  permission_change: 'warning',
  data_access: 'info',
  data_modification: 'primary',
  security_setting_change: 'warning',
  export_data: 'secondary',
};

const resourceColors: Record<AuditResource, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
  user: 'primary',
  role: 'secondary',
  permission: 'warning',
  data: 'info',
  security: 'error',
  export: 'success',
};

export default function AuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<{
    action: AuditAction | '';
    resource: AuditResource | '';
  }>({
    action: '',
    resource: '',
  });
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportDateRange, setExportDateRange] = useState({
    startDate: '',
    endDate: '',
  });

  const fetchLogs = async () => {
    try {
      const { logs, total } = await auditLogging.getLogs(
        {
          action: filters.action || undefined,
          resource: filters.resource || undefined,
        },
        page
      );
      setLogs(logs);
      setTotal(total);
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, filters]);

  const handleFilterChange = (field: keyof typeof filters, value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
    setPage(1);
  };

  const handleExport = async () => {
    try {
      const data = await auditLogging.exportLogs({
        action: filters.action || undefined,
        resource: filters.resource || undefined,
        startDate: exportDateRange.startDate || undefined,
        endDate: exportDateRange.endDate || undefined,
      });

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
      link.setAttribute('download', `audit_logs_export_${new Date().toISOString()}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Export failed:', error);
    }
    setExportDialogOpen(false);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Audit Logs
        </Typography>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={() => setExportDialogOpen(true)}
        >
          Export Logs
        </Button>
      </Box>

      <Card>
        <CardContent>
          <Box sx={{ mb: 2 }}>
            <Grid container spacing={2}>
              <Grid sx={{ width: { xs: '100%', sm: '50%', md: '25%' } }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Action</InputLabel>
                  <Select
                    value={filters.action}
                    label="Action"
                    onChange={(e: SelectChangeEvent) => handleFilterChange('action', e.target.value)}
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="user_create">User Create</MenuItem>
                    <MenuItem value="user_update">User Update</MenuItem>
                    <MenuItem value="user_delete">User Delete</MenuItem>
                    <MenuItem value="role_change">Role Change</MenuItem>
                    <MenuItem value="permission_change">Permission Change</MenuItem>
                    <MenuItem value="data_access">Data Access</MenuItem>
                    <MenuItem value="data_modification">Data Modification</MenuItem>
                    <MenuItem value="security_setting_change">Security Setting Change</MenuItem>
                    <MenuItem value="export_data">Export Data</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid sx={{ width: { xs: '100%', sm: '50%', md: '25%' } }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Resource</InputLabel>
                  <Select
                    value={filters.resource}
                    label="Resource"
                    onChange={(e: SelectChangeEvent) => handleFilterChange('resource', e.target.value)}
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="user">User</MenuItem>
                    <MenuItem value="role">Role</MenuItem>
                    <MenuItem value="permission">Permission</MenuItem>
                    <MenuItem value="data">Data</MenuItem>
                    <MenuItem value="security">Security</MenuItem>
                    <MenuItem value="export">Export</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Action</TableCell>
                  <TableCell>Resource</TableCell>
                  <TableCell>Details</TableCell>
                  <TableCell>IP Address</TableCell>
                  <TableCell>User Agent</TableCell>
                  <TableCell>Time</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <Chip
                        label={log.action}
                        color={actionColors[log.action]}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={log.resource}
                        color={resourceColors[log.resource]}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {JSON.stringify(log.details)}
                      </Typography>
                    </TableCell>
                    <TableCell>{log.ip}</TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {log.userAgent}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {formatDistanceToNow(new Date(log.createdAt), {
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
              count={Math.ceil(total / 50)}
              page={page}
              onChange={(_: React.ChangeEvent<unknown>, page: number) => setPage(page)}
            />
          </Box>
        </CardContent>
      </Card>

      <Dialog open={exportDialogOpen} onClose={() => setExportDialogOpen(false)}>
        <DialogTitle>Export Audit Logs</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
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