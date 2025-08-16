import React, { useState, useEffect } from 'react';
import { 
  Bug, 
  Search, 
  Filter, 
  RefreshCw, 
  Edit, 
  Calendar, 
  User, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Smartphone, 
  Monitor,
  ArrowUp,
  ArrowDown,
  Minus,
  X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { getSupabaseClient } from '../../lib/supabase';
import { format, formatDistanceToNow } from 'date-fns';

interface BugReport {
  id: string;
  bug_id: string;
  title: string;
  description: string;
  status: 'new' | 'in_progress' | 'fixed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: 'System' | 'Mobile App Technical';
  reported_by: string;
  user_id?: string;
  user_email?: string;
  assigned_to?: string;
  device_info?: any;
  app_version?: string;
  issue_type: string;
  source: 'mobile_app' | 'admin_panel';
  estimated_response_time?: string;
  admin_notes?: string;
  resolution_notes?: string;
  created_at: string;
  updated_at: string;
}

interface BugReportStats {
  total_bugs: number;
  new_bugs: number;
  in_progress_bugs: number;
  fixed_bugs: number;
  critical_bugs: number;
  high_priority_bugs: number;
  mobile_app_bugs: number;
  system_bugs: number;
}

const BugReportsView: React.FC = () => {
  const [bugReports, setBugReports] = useState<BugReport[]>([]);
  const [stats, setStats] = useState<BugReportStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<BugReport | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    source: '',
    search: ''
  });
  const [editForm, setEditForm] = useState({
    status: '',
    assigned_to: '',
    admin_notes: '',
    resolution_notes: ''
  });

  useEffect(() => {
    fetchBugReports();
    fetchStats();
  }, [filters]);

  const fetchBugReports = async () => {
    try {
      setLoading(true);
      
      const supabase = getSupabaseAdminClient();
      if (!supabase) {
        throw new Error('Supabase not initialized');
      }
      
      // Try to fetch from bug_reports table first
      const { data: bugReportsData, error: bugReportsError } = await supabase
        .from('bug_reports')
        .select('*')
        .order('created_at', { ascending: false })
      
      let bugReportsArray: BugReport[] = []
      
      if (!bugReportsError && bugReportsData && bugReportsData.length > 0) {
        // Transform database data to match interface
        bugReportsArray = bugReportsData.map(report => ({
          id: report.id,
          bug_id: report.bug_id || `BUG-${report.id}`,
          title: report.title,
          description: report.description,
          status: report.status || 'new',
          priority: report.priority || 'medium',
          category: report.category || 'System',
          reported_by: report.reported_by || 'Unknown',
          user_email: report.user_email,
          assigned_to: report.assigned_to,
          source: report.source || 'admin_panel',
          issue_type: report.issue_type || 'general',
          app_version: report.app_version,
          device_info: report.device_info,
          admin_notes: report.admin_notes,
          resolution_notes: report.resolution_notes,
          created_at: report.created_at,
          updated_at: report.updated_at
        }))
      } else {
        console.warn('No bug reports found in database, using sample data')
        // Fallback to sample data if no real data exists
        bugReportsArray = [
          {
            id: '1',
            bug_id: 'BUG-001',
            title: 'Sample Bug Report',
            description: 'This is a sample bug report. Real reports will appear here when submitted.',
            status: 'new',
            priority: 'medium',
            category: 'System',
            reported_by: 'sample_user',
            user_email: 'sample@example.com',
            source: 'admin_panel',
            issue_type: 'sample',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ]
      }

      // Apply filters
      const filteredReports = bugReportsArray.filter(report => {
        const matchesStatus = !filters.status || report.status === filters.status;
        const matchesPriority = !filters.priority || report.priority === filters.priority;
        const matchesSource = !filters.source || report.source === filters.source;
        const matchesSearch = !filters.search || 
          report.title.toLowerCase().includes(filters.search.toLowerCase()) ||
          report.description.toLowerCase().includes(filters.search.toLowerCase()) ||
          report.reported_by.toLowerCase().includes(filters.search.toLowerCase());
        
        return matchesStatus && matchesPriority && matchesSource && matchesSearch;
      });

      setBugReports(filteredReports);
    } catch (error) {
      console.error('Error fetching bug reports:', error);
      setBugReports([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const supabase = getSupabaseAdminClient();
      if (!supabase) {
        throw new Error('Supabase not initialized');
      }
      
      // Get real stats from database
      const { data: allBugs, error } = await supabase
        .from('bug_reports')
        .select('status, priority, source')
      
      if (error) {
        console.warn('Failed to fetch bug stats from database:', error)
        // Calculate stats from current bug reports as fallback
        const totalBugs = bugReports.length;
        const newBugs = bugReports.filter(b => b.status === 'new').length;
        const inProgressBugs = bugReports.filter(b => b.status === 'in_progress').length;
        const fixedBugs = bugReports.filter(b => b.status === 'fixed').length;
        const criticalBugs = bugReports.filter(b => b.priority === 'critical').length;
        const highPriorityBugs = bugReports.filter(b => b.priority === 'high').length;
        const mobileAppBugs = bugReports.filter(b => b.source === 'mobile_app').length;
        const systemBugs = bugReports.filter(b => b.source === 'admin_panel').length;
        
        setStats({
          total_bugs: totalBugs,
          new_bugs: newBugs,
          in_progress_bugs: inProgressBugs,
          fixed_bugs: fixedBugs,
          critical_bugs: criticalBugs,
          high_priority_bugs: highPriorityBugs,
          mobile_app_bugs: mobileAppBugs,
          system_bugs: systemBugs
        });
        return;
      }
      
      // Calculate stats from database data
      const totalBugs = allBugs?.length || 0;
      const newBugs = allBugs?.filter(b => b.status === 'new').length || 0;
      const inProgressBugs = allBugs?.filter(b => b.status === 'in_progress').length || 0;
      const fixedBugs = allBugs?.filter(b => b.status === 'fixed').length || 0;
      const criticalBugs = allBugs?.filter(b => b.priority === 'critical').length || 0;
      const highPriorityBugs = allBugs?.filter(b => b.priority === 'high').length || 0;
      const mobileAppBugs = allBugs?.filter(b => b.source === 'mobile_app').length || 0;
      const systemBugs = allBugs?.filter(b => b.source === 'admin_panel').length || 0;

      setStats({
        total_bugs: totalBugs,
        new_bugs: newBugs,
        in_progress_bugs: inProgressBugs,
        fixed_bugs: fixedBugs,
        critical_bugs: criticalBugs,
        high_priority_bugs: highPriorityBugs,
        mobile_app_bugs: mobileAppBugs,
        system_bugs: systemBugs
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Set zero stats on error
      setStats({
        total_bugs: 0,
        new_bugs: 0,
        in_progress_bugs: 0,
        fixed_bugs: 0,
        critical_bugs: 0,
        high_priority_bugs: 0,
        mobile_app_bugs: 0,
        system_bugs: 0
      });
    }
  };

  const updateBugReport = async (bugId: string, updates: any) => {
    try {
      // Update the bug report in the local state
      setBugReports(prev => prev.map(report => 
        report.bug_id === bugId 
          ? { ...report, ...updates, updated_at: new Date().toISOString() }
          : report
      ));

      // Refresh stats
      fetchStats();
      setShowModal(false);
      setSelectedReport(null);
    } catch (error) {
      console.error('Error updating bug report:', error);
    }
  };

  const handleEdit = (report: BugReport) => {
    setSelectedReport(report);
    setEditForm({
      status: report.status,
      assigned_to: report.assigned_to || '',
      admin_notes: report.admin_notes || '',
      resolution_notes: report.resolution_notes || ''
    });
    setShowModal(true);
  };

  const handleSubmit = () => {
    if (selectedReport) {
      updateBugReport(selectedReport.bug_id, editForm);
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical': return <AlertTriangle className="w-4 h-4 text-red-500" />
      case 'high': return <ArrowUp className="w-4 h-4 text-orange-500" />
      case 'medium': return <Minus className="w-4 h-4 text-yellow-500" />
      case 'low': return <ArrowDown className="w-4 h-4 text-green-500" />
      default: return <Minus className="w-4 h-4 text-gray-500" />
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical': return <Badge variant="danger" className="text-xs font-medium">Critical</Badge>
      case 'high': return <Badge variant="warning" className="text-xs font-medium">High</Badge>
      case 'medium': return <Badge variant="info" className="text-xs font-medium">Medium</Badge>
      case 'low': return <Badge variant="success" className="text-xs font-medium">Low</Badge>
      default: return <Badge variant="default" className="text-xs font-medium">{priority}</Badge>
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new': return <Badge variant="info" className="text-xs font-medium">New</Badge>
      case 'in_progress': return <Badge variant="warning" className="text-xs font-medium">In Progress</Badge>
      case 'fixed': return <Badge variant="success" className="text-xs font-medium">Fixed</Badge>
      default: return <Badge variant="default" className="text-xs font-medium">{status}</Badge>
    }
  };

  const getSourceIcon = (source: string) => {
    return source === 'mobile_app' ? (
      <Smartphone className="w-4 h-4 text-blue-500" />
    ) : (
      <Monitor className="w-4 h-4 text-purple-500" />
    );
  };

  const getSourceBadge = (source: string) => {
    return source === 'mobile_app' ? (
      <Badge variant="info" className="text-xs font-medium">Mobile App</Badge>
    ) : (
      <Badge variant="default" className="text-xs font-medium">Admin Panel</Badge>
    );
  };

  if (loading) {
    return (
      <div className="space-y-4 md:space-y-6 animate-fade-in">
        <div className="h-8 w-48 bg-gray-200 dark:bg-slate-700 animate-pulse rounded" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 md:h-32 bg-gray-200 dark:bg-slate-700 animate-pulse rounded-xl" />
          ))}
        </div>
        <div className="h-96 bg-gray-200 dark:bg-slate-700 animate-pulse rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white gaming-text-shadow">
            Bug Reports
          </h1>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-300">
            Track and manage bug reports from users and system monitoring
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Total: {stats?.total_bugs || 0} | New: {stats?.new_bugs || 0} | Critical: {stats?.critical_bugs || 0}
          </div>
          <Button 
            onClick={fetchBugReports}
            variant="outline"
            size="sm"
            disabled={loading}
            className="flex items-center space-x-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards - Enhanced Design */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 animate-stagger-children">
        <Card className="gaming-card-enhanced">
          <CardContent className="p-4 md:p-6 text-center">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center mx-auto mb-2 md:mb-3 gaming-glow">
              <Bug className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <div className="text-xl md:text-2xl font-bold text-blue-600 dark:text-blue-400 gaming-text-shadow">
              {stats?.new_bugs || 0}
            </div>
            <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">New Reports</div>
          </CardContent>
        </Card>

        <Card className="gaming-card-enhanced">
          <CardContent className="p-4 md:p-6 text-center">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg flex items-center justify-center mx-auto mb-2 md:mb-3 gaming-glow">
              <Clock className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <div className="text-xl md:text-2xl font-bold text-orange-600 dark:text-orange-400 gaming-text-shadow">
              {stats?.in_progress_bugs || 0}
            </div>
            <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">In Progress</div>
          </CardContent>
        </Card>

        <Card className="gaming-card-enhanced">
          <CardContent className="p-4 md:p-6 text-center">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center mx-auto mb-2 md:mb-3 gaming-glow">
              <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <div className="text-xl md:text-2xl font-bold text-emerald-600 dark:text-emerald-400 gaming-text-shadow">
              {stats?.fixed_bugs || 0}
            </div>
            <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Fixed</div>
          </CardContent>
        </Card>

        <Card className="gaming-card-enhanced">
          <CardContent className="p-4 md:p-6 text-center">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-red-500 to-rose-600 rounded-lg flex items-center justify-center mx-auto mb-2 md:mb-3 gaming-glow">
              <AlertTriangle className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <div className="text-xl md:text-2xl font-bold text-red-600 dark:text-red-400 gaming-text-shadow">
              {stats?.critical_bugs || 0}
            </div>
            <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Critical</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters - Optimized Layout */}
      <Card className="gaming-card-enhanced">
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by title, description, or reporter..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-10 text-sm"
              />
            </div>
            
            {/* Status Filter */}
            <select
              className="px-3 py-2 border border-violet-500/30 rounded-lg bg-violet-500/10 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 gaming-input min-w-[140px]"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="">All Status</option>
              <option value="new">New</option>
              <option value="in_progress">In Progress</option>
              <option value="fixed">Fixed</option>
            </select>

            {/* Priority Filter */}
            <select
              className="px-3 py-2 border border-violet-500/30 rounded-lg bg-violet-500/10 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 gaming-input min-w-[140px]"
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
            >
              <option value="">All Priority</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            {/* Source Filter */}
            <select
              className="px-3 py-2 border border-violet-500/30 rounded-lg bg-violet-500/10 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 gaming-input min-w-[140px]"
              value={filters.source}
              onChange={(e) => setFilters({ ...filters, source: e.target.value })}
            >
              <option value="">All Sources</option>
              <option value="mobile_app">Mobile App</option>
              <option value="admin_panel">Admin Panel</option>
            </select>

            {/* Clear Filters */}
            <Button 
              onClick={() => setFilters({ status: '', priority: '', source: '', search: '' })}
              variant="outline"
              className="flex items-center space-x-2 min-w-[120px]"
            >
              <X className="w-4 h-4" />
              <span>Clear</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bug Reports List - Enhanced Cards */}
      <div className="space-y-4">
        {bugReports.length === 0 ? (
          <Card className="gaming-card-enhanced">
            <CardContent className="p-8 md:p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bug className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No Bug Reports Found
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {Object.values(filters).some(f => f) 
                  ? 'Try adjusting your search or filters to see more results' 
                  : 'Bug reports will appear here when submitted by users or detected by the system'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          bugReports.map((report) => (
            <Card key={report.id} className="gaming-card-enhanced hover:scale-[1.01] transition-all duration-300">
              <CardContent className="p-4 md:p-6">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  {/* Main Content */}
                  <div className="flex-1 space-y-3">
                    {/* Header with badges */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                      <div className="flex items-center space-x-2">
                        {getSourceIcon(report.source)}
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-1">
                          {report.title}
                        </h3>
                      </div>
                      <div className="flex items-center space-x-2 flex-wrap">
                        {getPriorityIcon(report.priority)}
                        {getPriorityBadge(report.priority)}
                        {getStatusBadge(report.status)}
                        {getSourceBadge(report.source)}
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base line-clamp-2">
                      {report.description}
                    </p>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                      <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                        <User className="w-4 h-4" />
                        <span className="truncate">
                          {report.user_email || report.reported_by}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDistanceToNow(new Date(report.created_at))} ago</span>
                      </div>

                      {report.assigned_to && (
                        <div className="flex items-center space-x-2 text-violet-600 dark:text-violet-400">
                          <User className="w-4 h-4" />
                          <span>Assigned to: {report.assigned_to}</span>
                        </div>
                      )}

                      {report.app_version && (
                        <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                          <Smartphone className="w-4 h-4" />
                          <span>v{report.app_version}</span>
                        </div>
                      )}
                    </div>

                    {/* Device Info for Mobile Reports */}
                    {report.source === 'mobile_app' && report.device_info && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                        <div className="flex items-center space-x-2 text-blue-700 dark:text-blue-300 text-sm">
                          <Smartphone className="w-4 h-4" />
                          <span>
                            Device: {report.device_info.platform || 'Unknown'} 
                            {report.device_info.version && ` ${report.device_info.version}`}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Admin Notes */}
                    {report.admin_notes && (
                      <div className="bg-violet-50 dark:bg-violet-900/20 rounded-lg p-3 border-l-4 border-violet-500">
                        <div className="text-sm">
                          <span className="font-medium text-violet-700 dark:text-violet-300">Admin Notes: </span>
                          <span className="text-violet-600 dark:text-violet-400">{report.admin_notes}</span>
                        </div>
                      </div>
                    )}

                    {/* Resolution Notes */}
                    {report.resolution_notes && (
                      <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-3 border-l-4 border-emerald-500">
                        <div className="text-sm">
                          <span className="font-medium text-emerald-700 dark:text-emerald-300">Resolution: </span>
                          <span className="text-emerald-600 dark:text-emerald-400">{report.resolution_notes}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <div className="flex-shrink-0">
                    <Button 
                      onClick={() => handleEdit(report)} 
                      size="sm"
                      className="w-full lg:w-auto"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit Modal - Enhanced Design */}
      {showModal && selectedReport && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="gaming-modal max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-violet-500/20">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Bug className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Edit Bug Report</h2>
                  <p className="text-sm text-gray-400">Update bug report status and details</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setShowModal(false)}>
                <X className="w-5 h-5 text-white" />
              </Button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Bug Report Info */}
              <Card className="gaming-card">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      {getSourceIcon(selectedReport.source)}
                      <h3 className="font-semibold text-white">{selectedReport.title}</h3>
                      <div className="flex space-x-2">
                        {getPriorityBadge(selectedReport.priority)}
                        {getSourceBadge(selectedReport.source)}
                      </div>
                    </div>
                    <p className="text-gray-300 text-sm">{selectedReport.description}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-400">
                      <span>ID: {selectedReport.bug_id}</span>
                      <span>Reported: {format(new Date(selectedReport.created_at), 'MMM dd, yyyy HH:mm')}</span>
                      {selectedReport.user_email && <span>By: {selectedReport.user_email}</span>}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Edit Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                  <select
                    className="w-full px-3 py-2 border border-violet-500/30 rounded-lg bg-violet-500/10 text-white gaming-input"
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value as any })}
                  >
                    <option value="new">New</option>
                    <option value="in_progress">In Progress</option>
                    <option value="fixed">Fixed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Assign To</label>
                  <Input
                    value={editForm.assigned_to}
                    onChange={(e) => setEditForm({ ...editForm, assigned_to: e.target.value })}
                    placeholder="Admin username"
                    className="!bg-violet-500/10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Admin Notes</label>
                <textarea
                  className="w-full px-3 py-2 border border-violet-500/30 rounded-lg bg-violet-500/10 text-white placeholder-gray-400 gaming-input"
                  rows={3}
                  value={editForm.admin_notes}
                  onChange={(e) => setEditForm({ ...editForm, admin_notes: e.target.value })}
                  placeholder="Add internal notes for the team..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Resolution Notes</label>
                <textarea
                  className="w-full px-3 py-2 border border-violet-500/30 rounded-lg bg-violet-500/10 text-white placeholder-gray-400 gaming-input"
                  rows={3}
                  value={editForm.resolution_notes}
                  onChange={(e) => setEditForm({ ...editForm, resolution_notes: e.target.value })}
                  placeholder="Describe how this issue was resolved..."
                />
              </div>

              {/* Modal Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-violet-500/20">
                <Button 
                  onClick={() => setShowModal(false)} 
                  variant="outline" 
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmit} 
                  className="flex-1"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BugReportsView;