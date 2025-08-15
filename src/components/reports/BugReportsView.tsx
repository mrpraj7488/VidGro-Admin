import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { getSupabaseClient } from '../../lib/supabase';

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
    category: '',
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
      
      const supabase = getSupabaseClient();
      if (!supabase) {
        throw new Error('Supabase not initialized');
      }
      
      const { data, error } = await supabase.rpc('get_bug_reports_with_filters', {
        p_status_filter: filters.status || null,
        p_priority_filter: filters.priority || null,
        p_category_filter: filters.category || null,
        p_source_filter: filters.source || null,
        p_search_term: filters.search || null,
        p_limit_count: 100,
        p_offset_count: 0
      });

      if (error) throw error;
      setBugReports(data || []);
    } catch (error) {
      console.error('Error fetching bug reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) {
        throw new Error('Supabase not initialized');
      }
      
      const { data, error } = await supabase.rpc('get_bug_report_stats');
      if (error) throw error;
      setStats(data?.[0] || null);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const updateBugReport = async (bugId: string, updates: any) => {
    try {
      const { data, error } = await supabase.rpc('update_bug_report_status', {
        p_bug_id: bugId,
        p_status: updates.status,
        p_admin_notes: updates.admin_notes,
        p_resolution_notes: updates.resolution_notes
      });

      if (error) throw error;

      if (updates.assigned_to) {
        await supabase.rpc('assign_bug_report', {
          p_bug_id: bugId,
          p_assigned_to: updates.assigned_to
        });
      }

      // Refresh data
      fetchBugReports();
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-500';
      case 'in_progress': return 'bg-yellow-500';
      case 'fixed': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getSourceIcon = (source: string) => {
    return source === 'mobile_app' ? '📱' : '🖥️';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading bug reports...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Bug Reports</h1>
        <div className="text-sm text-gray-600">
          Total: {stats?.total_bugs || 0} | New: {stats?.new_bugs || 0} | Critical: {stats?.critical_bugs || 0}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats?.new_bugs || 0}</div>
            <div className="text-sm text-gray-600">New Reports</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{stats?.in_progress_bugs || 0}</div>
            <div className="text-sm text-gray-600">In Progress</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats?.fixed_bugs || 0}</div>
            <div className="text-sm text-gray-600">Fixed</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{stats?.critical_bugs || 0}</div>
            <div className="text-sm text-gray-600">Critical</div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <Input
            placeholder="Search..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
          <select
            className="border rounded px-3 py-2"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">All Status</option>
            <option value="new">New</option>
            <option value="in_progress">In Progress</option>
            <option value="fixed">Fixed</option>
          </select>
          <select
            className="border rounded px-3 py-2"
            value={filters.priority}
            onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
          >
            <option value="">All Priority</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <select
            className="border rounded px-3 py-2"
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
          >
            <option value="">All Categories</option>
            <option value="System">System</option>
            <option value="Mobile App Technical">Mobile App Technical</option>
          </select>
          <select
            className="border rounded px-3 py-2"
            value={filters.source}
            onChange={(e) => setFilters({ ...filters, source: e.target.value })}
          >
            <option value="">All Sources</option>
            <option value="mobile_app">Mobile App</option>
            <option value="admin_panel">Admin Panel</option>
          </select>
          <Button onClick={() => setFilters({ status: '', priority: '', category: '', source: '', search: '' })}>
            Clear Filters
          </Button>
        </div>
      </Card>

      {/* Bug Reports List */}
      <div className="space-y-4">
        {bugReports.map((report) => (
          <Card key={report.id} className="p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{getSourceIcon(report.source)}</span>
                  <h3 className="text-lg font-semibold">{report.title}</h3>
                  <Badge className={getPriorityColor(report.priority)}>
                    {report.priority}
                  </Badge>
                  <Badge className={getStatusColor(report.status)}>
                    {report.status}
                  </Badge>
                  <Badge variant="outline">{report.category}</Badge>
                </div>
                <p className="text-gray-600 mb-2">{report.description}</p>
                <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                  <span>Reported by: {report.reported_by}</span>
                  {report.user_email && <span>Email: {report.user_email}</span>}
                  {report.assigned_to && <span>Assigned to: {report.assigned_to}</span>}
                  {report.estimated_response_time && (
                    <span>ETA: {report.estimated_response_time}</span>
                  )}
                  <span>Created: {new Date(report.created_at).toLocaleDateString()}</span>
                  {report.source === 'mobile_app' && report.device_info && (
                    <span>Device: {report.device_info.platform || 'Unknown'}</span>
                  )}
                  {report.app_version && <span>App Version: {report.app_version}</span>}
                </div>
                {report.admin_notes && (
                  <div className="mt-2 p-2 bg-blue-50 rounded">
                    <strong>Admin Notes:</strong> {report.admin_notes}
                  </div>
                )}
                {report.resolution_notes && (
                  <div className="mt-2 p-2 bg-green-50 rounded">
                    <strong>Resolution:</strong> {report.resolution_notes}
                  </div>
                )}
              </div>
              <Button onClick={() => handleEdit(report)} size="sm">
                Edit
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Edit Modal */}
      {showModal && selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Edit Bug Report</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  className="w-full border rounded px-3 py-2"
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value as any })}
                >
                  <option value="new">New</option>
                  <option value="in_progress">In Progress</option>
                  <option value="fixed">Fixed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Assign To</label>
                <Input
                  value={editForm.assigned_to}
                  onChange={(e) => setEditForm({ ...editForm, assigned_to: e.target.value })}
                  placeholder="Admin username"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Admin Notes</label>
                <textarea
                  className="w-full border rounded px-3 py-2"
                  rows={3}
                  value={editForm.admin_notes}
                  onChange={(e) => setEditForm({ ...editForm, admin_notes: e.target.value })}
                  placeholder="Add admin notes..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Resolution Notes</label>
                <textarea
                  className="w-full border rounded px-3 py-2"
                  rows={3}
                  value={editForm.resolution_notes}
                  onChange={(e) => setEditForm({ ...editForm, resolution_notes: e.target.value })}
                  placeholder="Add resolution notes..."
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <Button onClick={handleSubmit} className="flex-1">
                Save Changes
              </Button>
              <Button 
                onClick={() => setShowModal(false)} 
                variant="outline" 
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BugReportsView;
