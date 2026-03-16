import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Calendar, Search, Download, Filter, User, FileText, AlertTriangle, CheckCircle, Info, Shield } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getAuditLogs } from '../../lib/api/auditlogs';
import { Skeleton } from '../ui/skeleton';

interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  userRole: string;
  action: string;
  module: string;
  details: string;
  ipAddress: string;
  severity: 'info' | 'warning' | 'critical';
  status: 'success' | 'failed';
}

export function AuditLogsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModule, setSelectedModule] = useState('all');
  const [selectedSeverity, setSelectedSeverity] = useState('all');

  const { data: logsData, isLoading, error } = useQuery({
    queryKey: ['auditLogs', { selectedModule, selectedSeverity, searchQuery }],
    queryFn: async () => {
      const res = await getAuditLogs({ action: searchQuery || undefined });
      if (!res.success) throw new Error(res.error);
      return res.data || [];
    },
  });

  const auditLogs: AuditLog[] = useMemo(() => {
    return (logsData || []).map((l: any) => ({
      id: l.id,
      timestamp: (l.created_at || '').replace('T', ' ').slice(0, 19),
      user: l.actor_name || 'Unknown',
      userRole: '-',
      action: l.action,
      module: l.entity || '-',
      details: typeof l.details === 'string' ? l.details : JSON.stringify(l.details || {}),
      ipAddress: '-',
      severity: 'info' as const,
      status: 'success' as const,
    }));
  }, [logsData]);

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         log.details.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesModule = selectedModule === 'all' || log.module === selectedModule;
    const matchesSeverity = selectedSeverity === 'all' || log.severity === selectedSeverity;
    return matchesSearch && matchesModule && matchesSeverity;
  });

  const criticalLogs = auditLogs.filter(log => log.severity === 'critical').length;
  const warningLogs = auditLogs.filter(log => log.severity === 'warning').length;
  const failedActions = auditLogs.filter(log => log.status === 'failed').length;

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-xl sm:text-2xl font-bold">
            <Shield className="w-7 h-7 sm:w-8 sm:h-8" />
            Audit Logs
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">Track all system changes and user actions</p>
        </div>
        <Button variant="outline" className="w-full sm:w-auto">
          <Download className="mr-2 h-4 w-4" />
          Export Logs
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Logs</p>
                <h2 className="mt-2 text-2xl font-bold">{auditLogs.length}</h2>
                <Badge variant="secondary" className="mt-2">Last 24h</Badge>
              </div>
              <div className="bg-primary p-3 rounded-lg text-primary-foreground">
                <FileText className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Critical Events</p>
                <h2 className="mt-2 text-2xl font-bold">{criticalLogs}</h2>
                <Badge variant="destructive" className="mt-2">Needs attention</Badge>
              </div>
              <div className="bg-destructive p-3 rounded-lg text-destructive-foreground">
                <AlertTriangle className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Warnings</p>
                <h2 className="mt-2 text-2xl font-bold">{warningLogs}</h2>
                <Badge variant="secondary" className="mt-2">Monitor</Badge>
              </div>
              <div className="bg-amber-500 p-3 rounded-lg text-white">
                <AlertTriangle className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Failed Actions</p>
                <h2 className="mt-2 text-2xl font-bold">{failedActions}</h2>
                <Badge variant="secondary" className="mt-2">Security</Badge>
              </div>
              <div className="bg-destructive p-3 rounded-lg text-destructive-foreground">
                <Shield className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedModule} onValueChange={setSelectedModule}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Modules</SelectItem>
                <SelectItem value="User Management">User Management</SelectItem>
                <SelectItem value="Grading">Grading</SelectItem>
                <SelectItem value="Authentication">Authentication</SelectItem>
                <SelectItem value="Assignments">Assignments</SelectItem>
                <SelectItem value="Settings">Settings</SelectItem>
                <SelectItem value="Finance">Finance</SelectItem>
                <SelectItem value="Attendance">Attendance</SelectItem>
                <SelectItem value="Library">Library</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severity Levels</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="info">Info</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Log</CardTitle>
          <CardDescription>
            Detailed record of all system actions and changes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Module</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <TableRow key={i}><TableCell colSpan={7}><Skeleton className="h-10 w-full" /></TableCell></TableRow>
                    ))}
                  </>
                ) : error ? (
                  <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">Failed to load logs</TableCell></TableRow>
                ) : filteredLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12">
                      <Shield className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No audit logs found</p>
                    </TableCell>
                  </TableRow>
                ) : filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-sm">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        {log.timestamp}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{log.user}</span>
                      </div>
                    </TableCell>
                    <TableCell>{log.action}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{log.module}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                      {log.details}
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        log.severity === 'critical' ? 'destructive' :
                        log.severity === 'warning' ? 'secondary' : 'default'
                      }>
                        {log.severity === 'info' ? <Info className="h-3 w-3 mr-1" /> : <AlertTriangle className="h-3 w-3 mr-1" />}
                        {log.severity}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={log.status === 'success' ? 'default' : 'destructive'}>
                        {log.status === 'success' ? <CheckCircle className="h-3 w-3 mr-1" /> : <AlertTriangle className="h-3 w-3 mr-1" />}
                        {log.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
