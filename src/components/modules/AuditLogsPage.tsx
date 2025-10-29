import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Calendar, Search, Download, Filter, User, FileText, AlertTriangle, CheckCircle, Info } from 'lucide-react';

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

  // Mock data
  const auditLogs: AuditLog[] = [
    {
      id: '1',
      timestamp: '2025-10-19 14:32:15',
      user: 'Sarah Johnson',
      userRole: 'Admin',
      action: 'Created new user account',
      module: 'User Management',
      details: 'Created student account for John Smith (ID: ST2025-045)',
      ipAddress: '192.168.1.105',
      severity: 'info',
      status: 'success'
    },
    {
      id: '2',
      timestamp: '2025-10-19 14:15:42',
      user: 'Michael Chen',
      userRole: 'Teacher',
      action: 'Updated grades',
      module: 'Grading',
      details: 'Updated final grades for Mathematics - Grade 10 (15 students)',
      ipAddress: '192.168.1.112',
      severity: 'info',
      status: 'success'
    },
    {
      id: '3',
      timestamp: '2025-10-19 13:58:03',
      user: 'System',
      userRole: 'System',
      action: 'Failed login attempt',
      module: 'Authentication',
      details: 'Multiple failed login attempts from user: admin@school.edu',
      ipAddress: '45.123.89.201',
      severity: 'warning',
      status: 'failed'
    },
    {
      id: '4',
      timestamp: '2025-10-19 13:45:22',
      user: 'Emily Rodriguez',
      userRole: 'Teacher',
      action: 'Published assignment',
      module: 'Assignments',
      details: 'Published assignment "Chapter 7 Lab Report" to Science - Grade 11',
      ipAddress: '192.168.1.118',
      severity: 'info',
      status: 'success'
    },
    {
      id: '5',
      timestamp: '2025-10-19 12:30:11',
      user: 'Sarah Johnson',
      userRole: 'Admin',
      action: 'Modified system settings',
      module: 'Settings',
      details: 'Changed academic year start date to 2025-09-01',
      ipAddress: '192.168.1.105',
      severity: 'critical',
      status: 'success'
    },
    {
      id: '6',
      timestamp: '2025-10-19 11:22:45',
      user: 'James Wilson',
      userRole: 'Librarian',
      action: 'Added library resource',
      module: 'Library',
      details: 'Added 25 new books to library inventory',
      ipAddress: '192.168.1.125',
      severity: 'info',
      status: 'success'
    },
    {
      id: '7',
      timestamp: '2025-10-19 10:15:33',
      user: 'Finance System',
      userRole: 'System',
      action: 'Processed payment',
      module: 'Finance',
      details: 'Processed fee payment for student Emma Thompson ($1,200)',
      ipAddress: '192.168.1.100',
      severity: 'info',
      status: 'success'
    },
    {
      id: '8',
      timestamp: '2025-10-19 09:45:18',
      user: 'Michael Chen',
      userRole: 'Teacher',
      action: 'Marked attendance',
      module: 'Attendance',
      details: 'Submitted attendance for Mathematics - Period 2 (28/30 present)',
      ipAddress: '192.168.1.112',
      severity: 'info',
      status: 'success'
    },
    {
      id: '9',
      timestamp: '2025-10-19 08:30:05',
      user: 'System',
      userRole: 'System',
      action: 'Automated backup',
      module: 'System',
      details: 'Completed daily database backup (2.4 GB)',
      ipAddress: '127.0.0.1',
      severity: 'info',
      status: 'success'
    },
    {
      id: '10',
      timestamp: '2025-10-18 16:55:42',
      user: 'Sarah Johnson',
      userRole: 'Admin',
      action: 'Deleted user account',
      module: 'User Management',
      details: 'Removed graduated student account: David Lee (ID: ST2024-312)',
      ipAddress: '192.168.1.105',
      severity: 'warning',
      status: 'success'
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'info': return 'bg-blue-500/10 text-blue-400';
      case 'warning': return 'bg-yellow-500/10 text-yellow-400';
      case 'critical': return 'bg-red-500/10 text-red-400';
      default: return 'bg-gray-500/10 text-gray-400';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'info': return <Info className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'critical': return <AlertTriangle className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-500/10 text-green-400';
      case 'failed': return 'bg-red-500/10 text-red-400';
      default: return 'bg-gray-500/10 text-gray-400';
    }
  };

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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-white">Audit Logs</h1>
          <p className="text-gray-400 mt-1">Track all system changes and user actions</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Download className="mr-2 h-4 w-4" />
          Export Logs
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardDescription className="text-gray-400">Total Logs</CardDescription>
            <CardTitle className="text-white text-3xl">{auditLogs.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-400">Last 24 hours</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardDescription className="text-gray-400">Critical Events</CardDescription>
            <CardTitle className="text-white text-3xl text-red-500">{criticalLogs}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-red-400">Needs attention</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardDescription className="text-gray-400">Warnings</CardDescription>
            <CardTitle className="text-white text-3xl text-yellow-500">{warningLogs}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-400">Monitor closely</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardDescription className="text-gray-400">Failed Actions</CardDescription>
            <CardTitle className="text-white text-3xl text-red-500">{failedActions}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-400">Security review</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <CardTitle className="text-white">Filters</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-700 border-gray-600 text-white"
              />
            </div>
            <Select value={selectedModule} onValueChange={setSelectedModule}>
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
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
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
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
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Activity Log</CardTitle>
          <CardDescription className="text-gray-400">
            Detailed record of all system actions and changes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-gray-700">
                <TableHead className="text-gray-300">Timestamp</TableHead>
                <TableHead className="text-gray-300">User</TableHead>
                <TableHead className="text-gray-300">Action</TableHead>
                <TableHead className="text-gray-300">Module</TableHead>
                <TableHead className="text-gray-300">Details</TableHead>
                <TableHead className="text-gray-300">IP Address</TableHead>
                <TableHead className="text-gray-300">Severity</TableHead>
                <TableHead className="text-gray-300">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id} className="border-gray-700">
                  <TableCell className="text-gray-300">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {log.timestamp}
                    </div>
                  </TableCell>
                  <TableCell className="text-white">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <div>
                        <div>{log.user}</div>
                        <div className="text-xs text-gray-500">{log.userRole}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-300">{log.action}</TableCell>
                  <TableCell>
                    <Badge className="bg-gray-700 text-gray-300">
                      {log.module}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-400 text-sm max-w-xs truncate">
                    {log.details}
                  </TableCell>
                  <TableCell className="text-gray-400 font-mono text-xs">
                    {log.ipAddress}
                  </TableCell>
                  <TableCell>
                    <Badge className={getSeverityColor(log.severity)}>
                      {getSeverityIcon(log.severity)}
                      <span className="ml-1">{log.severity}</span>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(log.status)}>
                      {log.status === 'success' ? <CheckCircle className="h-3 w-3 mr-1" /> : <AlertTriangle className="h-3 w-3 mr-1" />}
                      {log.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
