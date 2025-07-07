import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import './UserDashboard.css';

const UserDashboard = ({ user }) => {
  const [forms, setForms] = useState([]);
  const [selectedForm, setSelectedForm] = useState(null);
  const [activeTab, setActiveTab] = useState('Insights');
  const [responses, setResponses] = useState([]);
  const [responsesLoading, setResponsesLoading] = useState(false);
  const [responsesError, setResponsesError] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('list');
  const [sortBy, setSortBy] = useState('date');
  const [toast, setToast] = useState('');
  const [responders, setResponders] = useState([]);
  const [respondersLoading, setRespondersLoading] = useState(false);
  const [respondersError, setRespondersError] = useState('');
  const [insights, setInsights] = useState({ views: 0, starts: 0, submissions: 0, completionRate: 0, avgTime: null });
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [insightsError, setInsightsError] = useState('');
  const [responderSearch, setResponderSearch] = useState('');
  const [openMenuFormId, setOpenMenuFormId] = useState(null);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  const [renameForm, setRenameForm] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusForm, setStatusForm] = useState(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteStep, setInviteStep] = useState(1);
  const [inviteFormId, setInviteFormId] = useState('');
  const [inviteForm, setInviteForm] = useState(null);
  const [collaborators, setCollaborators] = useState([]);
  const [inviteEmails, setInviteEmails] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState('');
  const [collabLink, setCollabLink] = useState('');
  const [collabLinkLoading, setCollabLinkLoading] = useState(false);
  const [collabLinkError, setCollabLinkError] = useState('');
  const menuRef = useRef(null);
  const [workspaces, setWorkspaces] = useState([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);
  const [showWorkspaceModal, setShowWorkspaceModal] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [showCreateFormModal, setShowCreateFormModal] = useState(false);
  const [selectedWorkspaceForForm, setSelectedWorkspaceForForm] = useState(null);
  const [responsesView, setResponsesView] = useState('responses'); // 'responses' or 'responders'
  const [responsesSearch, setResponsesSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  useEffect(() => {
    if (selectedWorkspace) {
      fetchWorkspaceForms(selectedWorkspace._id);
    }
  }, [selectedWorkspace]);

  const fetchWorkspaces = async () => {
    try {
      const res = await api.get('/users/workspaces');
      const allWorkspaces = res.data.workspaces || [];
      setWorkspaces(allWorkspaces);
      // Prefer 'My Workspace' as default
      const myWs = allWorkspaces.find(ws => ws.name.toLowerCase() === 'my workspace');
      if (myWs) {
        setSelectedWorkspace(myWs);
      } else if (allWorkspaces.length > 0) {
        setSelectedWorkspace(allWorkspaces[0]);
      } else {
        setSelectedWorkspace(null);
      }
    } catch (e) {
      setWorkspaces([]);
      setSelectedWorkspace(null);
    }
  };

  const fetchWorkspaceForms = async (workspaceId) => {
    setLoading(true);
    try {
      const res = await api.get(`/form/workspace/${workspaceId}`);
      setForms(res.data);
    } catch (e) {
      setForms([]);
    }
    setLoading(false);
  };

  const handleWorkspaceSelect = (ws) => {
    setSelectedWorkspace(ws);
  };

  const handleCreateWorkspace = async () => {
    if (!newWorkspaceName.trim()) return;
    try {
      const res = await api.post('/users/workspaces', { name: newWorkspaceName });
      setWorkspaces([...workspaces, res.data]);
      setSelectedWorkspace(res.data);
      setShowWorkspaceModal(false);
      setNewWorkspaceName('');
    } catch (e) {}
  };

  useEffect(() => {
    fetchUserForms();
  }, []);

  const fetchUserForms = async () => {
    try {
      const response = await api.get('/form/user/forms');
      setForms(response.data);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to load forms');
    } finally {
      setLoading(false);
    }
  };

  const fetchFormResponses = async (formId) => {
    try {
      const response = await api.get(`/form/${formId}/responses`);
      setResponses(response.data);
    } catch (error) {
      console.error('Form responses fetch error:', error);
      setError('Failed to load responses');
    }
  };

  const handleFormSelect = (form) => {
    setSelectedForm(form);
    fetchFormResponses(form._id);
  };

  const handleCopyLink = (formId) => {
    const link = `${window.location.origin}/form/${formId}`;
    navigator.clipboard.writeText(link);
    setToast('Copied!');
    setTimeout(() => setToast(''), 1500);
  };

  const deleteForm = async (formId) => {
    if (!window.confirm('Are you sure you want to delete this form?')) return;
    try {
      await api.delete(`/form/${formId}`);
      setForms(forms.filter(form => form._id !== formId));
      if (selectedForm && selectedForm._id === formId) setSelectedForm(null);
      alert('Form deleted successfully!');
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to delete form');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Sidebar workspace count
  const workspaceCount = forms.length;

  // Sort forms
  const sortedForms = [...forms].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.createdAt) - new Date(a.createdAt);
    } else {
      return a.title.localeCompare(b.title);
    }
  });

  // Export submission status as CSV
  const exportSubmissionStatus = () => {
    if (!responses.length) {
      alert('No responses to export');
      return;
    }

    const headers = ['Response #', 'Name', 'Email', 'Submission Date', 'Status'];
    const csvData = responses.map((response, index) => [
      index + 1,
      response.submitterName,
      response.submitterEmail,
      formatDate(response.submittedAt),
      'Submitted'
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${selectedForm.title}_submission_status.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export responses as CSV (anonymous format)
  const exportResponses = () => {
    if (!responses.length || !selectedForm) {
      alert('No responses to export');
      return;
    }

    // Create headers with question labels
    const headers = ['Response #', ...selectedForm.questions.map(q => q.label)];
    
    // Create CSV data
    const csvData = responses.map((response, index) => {
      const row = [index + 1]; // Response number
      
      selectedForm.questions.forEach(question => {
        const answer = response.answers[question.id];
        const formattedAnswer = Array.isArray(answer) ? answer.join('; ') : (answer || 'No answer');
        row.push(formattedAnswer);
      });
      
      return row;
    });

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${selectedForm.title}_anonymous_responses.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Mock stats for insights
  const mockStats = {
    views: 1,
    starts: 1,
    submissions: 0,
    completionRate: 0,
    timeToComplete: '—',
  };

  // Fetch responses for the selected form (when Responses tab is selected)
  useEffect(() => {
    if (selectedForm && activeTab === 'Responses') {
      setResponsesLoading(true);
      setResponsesError('');
      api.get(`/form/${selectedForm._id}/responses`)
        .then(res => setResponses(res.data))
        .catch(err => setResponsesError('Failed to load responses'))
        .finally(() => setResponsesLoading(false));
    }
  }, [selectedForm, activeTab]);

  // Fetch responders for the selected form (when Responder tab is selected)
  useEffect(() => {
    if (selectedForm && activeTab === 'Responder') {
      setRespondersLoading(true);
      setRespondersError('');
      api.get(`/form/${selectedForm._id}/responders`)
        .then(res => setResponders(res.data.responders))
        .catch(err => setRespondersError('Failed to load responders'))
        .finally(() => setRespondersLoading(false));
    }
  }, [selectedForm, activeTab]);

  // Fetch insights when Insights tab is opened
  useEffect(() => {
    if (selectedForm && activeTab === 'Insights') {
      setInsightsLoading(true);
      setInsightsError('');
      api.get(`/form/${selectedForm._id}/insights`)
        .then(res => setInsights(res.data))
        .catch(() => setInsightsError('Failed to load insights'))
        .finally(() => setInsightsLoading(false));
    }
  }, [selectedForm, activeTab]);

  // Close menu on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuFormId(null);
      }
    }
    if (openMenuFormId) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openMenuFormId]);

  const handleRename = (form) => {
    setRenameForm(form);
    setRenameValue(form.title);
    setShowRenameModal(true);
    setOpenMenuFormId(null);
  };

  const handleRenameSave = () => {
    if (renameValue && renameForm && renameValue !== renameForm.title) {
      api.patch(`/form/${renameForm._id}/rename`, { title: renameValue })
        .then(() => fetchUserForms())
        .catch(() => alert('Failed to rename form.'));
    }
    setShowRenameModal(false);
    setRenameForm(null);
    setRenameValue('');
  };

  const handleRenameCancel = () => {
    setShowRenameModal(false);
    setRenameForm(null);
    setRenameValue('');
  };

  const handleOpenClose = (form) => {
    setStatusForm(form);
    setShowStatusModal(true);
    setOpenMenuFormId(null);
  };

  const handleStatusConfirm = () => {
    if (!statusForm) return;
    setForms(prevForms => prevForms.map(f => f._id === statusForm._id ? { ...f, isActive: !statusForm.isActive } : f));
    api.patch(`/form/${statusForm._id}/status`, { isActive: !statusForm.isActive })
      .then(() => fetchUserForms())
      .catch(() => alert('Failed to update form status.'));
    setShowStatusModal(false);
    setStatusForm(null);
  };

  const handleStatusCancel = () => {
    setShowStatusModal(false);
    setStatusForm(null);
  };

  // Invite Modal Handlers
  const openInviteModal = () => {
    setShowInviteModal(true);
    setInviteStep(1);
    setInviteFormId('');
    setInviteForm(null);
    setCollaborators([]);
    setInviteEmails('');
    setInviteError('');
  };

  const closeInviteModal = () => {
    setShowInviteModal(false);
    setInviteStep(1);
    setInviteFormId('');
    setInviteForm(null);
    setCollaborators([]);
    setInviteEmails('');
    setInviteError('');
  };

  const handleFormSelectForInvite = async (formId) => {
    setInviteFormId(formId);
    setInviteStep(2);
    setInviteError('');
    setInviteLoading(true);
    try {
      const form = forms.find(f => f._id === formId);
      setInviteForm(form);
      const res = await api.get(`/form/${formId}/collaborators`);
      setCollaborators(res.data.collaborators);
    } catch (err) {
      setInviteError('Failed to load collaborators');
    } finally {
      setInviteLoading(false);
    }
  };

  const handleAddCollaborators = async () => {
    setInviteLoading(true);
    setInviteError('');
    const emails = inviteEmails.split(',').map(e => e.trim()).filter(Boolean);
    if (!emails.length) {
      setInviteError('Please enter at least one email');
      setInviteLoading(false);
      return;
    }
    try {
      const res = await api.post(`/form/${inviteFormId}/collaborators`, { emails });
      setCollaborators(res.data.collaborators);
      setInviteEmails('');
    } catch (err) {
      setInviteError('Failed to add collaborators');
    } finally {
      setInviteLoading(false);
    }
  };

  const handleRemoveCollaborator = async (email) => {
    setInviteLoading(true);
    setInviteError('');
    try {
      const res = await api.delete(`/form/${inviteFormId}/collaborators`, { data: { email } });
      setCollaborators(res.data.collaborators);
    } catch (err) {
      setInviteError('Failed to remove collaborator');
    } finally {
      setInviteLoading(false);
    }
  };

  const handleGenerateCollabLink = async () => {
    setCollabLinkLoading(true);
    setCollabLinkError('');
    setCollabLink('');
    try {
      const res = await api.post(`/form/${inviteFormId}/invite-link`);
      setCollabLink(res.data.link);
    } catch (err) {
      setCollabLinkError('Failed to generate link');
    } finally {
      setCollabLinkLoading(false);
    }
  };

  const handleCopyCollabLink = () => {
    if (collabLink) {
      navigator.clipboard.writeText(collabLink);
      setToast('Link copied!');
      setTimeout(() => setToast(''), 1500);
    }
  };

  // Find My Workspace
  const myWorkspace = workspaces.find(ws => ws.name.toLowerCase() === 'my workspace');

  const handleOpenCreateFormModal = () => {
    setSelectedWorkspaceForForm(selectedWorkspace || myWorkspace || workspaces[0] || null);
    setShowCreateFormModal(true);
  };

  const handleConfirmCreateForm = () => {
    setShowCreateFormModal(false);
    // Pass workspaceId as state to CreateForm page
    navigate('/create-form', { state: { workspaceId: selectedWorkspaceForForm?._id || myWorkspace?._id } });
  };

  if (error) {
    return (
      <div className="page-section">
        <h2 className="page-title">User Dashboard</h2>
        <div className="page-content">
          <div className="dashboard-container">
            <div className="error-message">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
            <button onClick={fetchUserForms} className="dashboard-btn">
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard stats
  const totalForms = forms.length;
  const totalResponses = forms.reduce((sum, form) => sum + (form.responseCount || 0), 0);
  const activeForms = forms.filter(form => form.isActive).length;

  return (
    <div className="tf-dashboard-root">
      {/* Toast */}
      {toast && <div className="tf-toast">{toast}</div>}
      {/* Sidebar */}
      <aside className="tf-sidebar">
        <button className="tf-create-form-btn" onClick={handleOpenCreateFormModal}>+ Create a new form</button>
        <div className="tf-sidebar-section tf-sidebar-search">
          <input type="text" placeholder="Search" className="tf-sidebar-search-input" />
        </div>
        <div className="tf-sidebar-section tf-sidebar-workspaces">
          <div className="sidebar-title-row">
            <span>Workspaces</span>
            <button
              className="add-workspace-btn"
              onClick={() => setShowWorkspaceModal(true)}
              aria-label="Add workspace"
            >
              +
            </button>
          </div>
          <div className="tf-sidebar-workspace-list">
            {workspaces.map(ws => (
              <div
                key={ws._id}
                className={`sidebar-workspace-item${selectedWorkspace && ws._id === selectedWorkspace._id ? ' active' : ''}`}
                onClick={() => handleWorkspaceSelect(ws)}
              >
                <span>{ws.name}</span>
                <span className="sidebar-workspace-count">{ws.forms ? ws.forms.length : 0}</span>
              </div>
            ))}
            {workspaces.length === 0 && myWorkspace && (
              <div
                key={myWorkspace._id}
                className={`sidebar-workspace-item active`}
                onClick={() => setSelectedWorkspace(myWorkspace)}
              >
                <span>{myWorkspace.name}</span>
                <span className="sidebar-workspace-count">0</span>
              </div>
            )}
          </div>
        </div>
        <div className="tf-sidebar-section tf-sidebar-responses">
          <div className="tf-sidebar-section-title">Responses collected</div>
          <div className="tf-sidebar-responses-count">0 / 10</div>
          <div className="tf-sidebar-responses-reset">Resets on Jul 19</div>
          <button className="tf-sidebar-increase-btn">Increase response limit</button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="tf-main-content">
        {loading ? (
          <div className="tf-loading" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
            <div className="tf-loading-spinner" />
            <div style={{ marginTop: 16, color: '#555', fontWeight: 500 }}>Loading...</div>
          </div>
        ) : selectedForm ? (
          <div className="tf-form-insights-panel">
            <button className="tf-back-btn" onClick={() => { setSelectedForm(null); setActiveTab('Insights'); }}>&larr; Back</button>
            {/* Tabs */}
            <div className="tf-insights-tabs">
              {['Smart Insights', 'Insights', 'Summary', 'Responses'].map(tab => (
                <div
                  key={tab}
                  className={`tf-insights-tab${activeTab === tab ? ' active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </div>
              ))}
            </div>
            {/* Tab Content */}
            {activeTab === 'Smart Insights' && (
              <div className="tf-insights-illustration">
                <div className="tf-insights-illustration-img">
                  <svg width="120" height="80" viewBox="0 0 120 80" fill="none"><rect width="120" height="80" rx="16" fill="#F7FAF9"/><text x="50%" y="50%" textAnchor="middle" fill="#bdbdbd" fontSize="16" dy=".3em">Smart Insights</text></svg>
                </div>
                <div className="tf-insights-illustration-title">AI-powered insights coming soon</div>
                <div className="tf-insights-illustration-desc">Get actionable suggestions and trends for your form as we add more analytics features.</div>
              </div>
            )}
            {activeTab === 'Insights' && (
              <>
                {/* Filters */}
                <div className="tf-insights-filters">
                  <button className="tf-insights-filter-btn">All time <span role="img" aria-label="calendar">📅</span></button>
                  <button className="tf-insights-filter-btn">All devices <span role="img" aria-label="devices">💻</span></button>
                </div>
                {/* Stats Row */}
                {insightsLoading ? (
                  <div className="tf-loading">Loading insights...</div>
                ) : insightsError ? (
                  <div className="tf-error">{insightsError}</div>
                ) : (
                  <div className="tf-insights-stats-row">
                    <div className="tf-insights-stat">
                      <div className="tf-insights-stat-label">Views</div>
                      <div className="tf-insights-stat-value">{insights.views}</div>
                    </div>
                    <div className="tf-insights-stat">
                      <div className="tf-insights-stat-label">Starts</div>
                      <div className="tf-insights-stat-value">{insights.starts}</div>
                    </div>
                    <div className="tf-insights-stat">
                      <div className="tf-insights-stat-label">Submissions</div>
                      <div className="tf-insights-stat-value">{insights.submissions}</div>
                    </div>
                    <div className="tf-insights-stat">
                      <div className="tf-insights-stat-label">Completion rate</div>
                      <div className="tf-insights-stat-value">{insights.completionRate}%</div>
                    </div>
                    <div className="tf-insights-stat">
                      <div className="tf-insights-stat-label">Time to complete</div>
                      <div className="tf-insights-stat-value">{insights.avgTime !== null ? `${insights.avgTime} sec` : '—'}</div>
                    </div>
                  </div>
                )}
                {/* Insights Illustration/Placeholder */}
                <div className="tf-insights-illustration">
                  <div className="tf-insights-illustration-img">
                    <svg width="120" height="80" viewBox="0 0 120 80" fill="none"><rect width="120" height="80" rx="16" fill="#F7FAF9"/><text x="50%" y="50%" textAnchor="middle" fill="#bdbdbd" fontSize="16" dy=".3em">Insights</text></svg>
                  </div>
                  <div className="tf-insights-illustration-title">Question drop-off rate</div>
                  <div className="tf-insights-illustration-desc">See where people abandon your form—the first step to improving your questions so you get more responses</div>
                </div>
              </>
            )}
            {activeTab === 'Summary' && (
              <div className="tf-summary-tab">
                <h2 className="tf-summary-title">{selectedForm.title}</h2>
                <div className="tf-summary-desc">{selectedForm.description}</div>
                <div className="tf-summary-questions">
                  <h3>Questions</h3>
                  <ul>
                    {selectedForm.questions && selectedForm.questions.map((q, idx) => (
                      <li key={q.id || idx}><strong>{q.label}</strong> <span className="tf-summary-qtype">({q.type})</span></li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            {activeTab === 'Responses' && (
              <div className="tf-responses-tab">
                <div className="tf-responses-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h3>Responses</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <input
                      type="text"
                      className="tf-responder-search"
                      placeholder={responsesView === 'responses' ? 'Search responses...' : 'Search responders...'}
                      value={responsesSearch}
                      onChange={e => setResponsesSearch(e.target.value)}
                      style={{ minWidth: 220 }}
                    />
                    <div className="tf-toggle-switch">
                      <button
                        className={responsesView === 'responses' ? 'active' : ''}
                        onClick={() => setResponsesView('responses')}
                        style={{
                          border: 'none',
                          background: responsesView === 'responses' ? '#111' : '#f3f4f6',
                          color: responsesView === 'responses' ? '#fff' : '#222',
                          fontWeight: 600,
                          borderRadius: '8px 0 0 8px',
                          padding: '0.5rem 1.2rem',
                          cursor: 'pointer',
                          transition: 'background 0.15s, color 0.15s',
                        }}
                      >Responses</button>
                      <button
                        className={responsesView === 'responders' ? 'active' : ''}
                        onClick={() => setResponsesView('responders')}
                        style={{
                          border: 'none',
                          background: responsesView === 'responders' ? '#111' : '#f3f4f6',
                          color: responsesView === 'responders' ? '#fff' : '#222',
                          fontWeight: 600,
                          borderRadius: '0 8px 8px 0',
                          padding: '0.5rem 1.2rem',
                          cursor: 'pointer',
                          transition: 'background 0.15s, color 0.15s',
                        }}
                      >Responders</button>
                    </div>
                    <button className="tf-export-csv-btn" onClick={() => {
                      if (responsesView === 'responses') {
                        if (!responses.length || !selectedForm) return;
                        const headers = selectedForm.questions.map(q => q.label);
                        const rows = responses.map(resp =>
                          selectedForm.questions.map(q => {
                            const ans = resp.answers[q.id];
                            return Array.isArray(ans) ? ans.join('; ') : (ans || '');
                          })
                        );
                        const csvContent = 'data:text/csv;charset=utf-8,' +
                          [headers, ...rows].map(row => row.map(field => `"${field}"`).join(',')).join('\n');
                        const encodedUri = encodeURI(csvContent);
                        const link = document.createElement('a');
                        link.setAttribute('href', encodedUri);
                        link.setAttribute('download', 'responses.csv');
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      } else {
                        if (!responders.length) return;
                        const csvContent = 'data:text/csv;charset=utf-8,' + ['Responder Name', ...responders].map(email => `"${email}"`).join('\n');
                        const encodedUri = encodeURI(csvContent);
                        const link = document.createElement('a');
                        link.setAttribute('href', encodedUri);
                        link.setAttribute('download', 'responders.csv');
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }
                    }}>Export CSV</button>
                  </div>
                </div>
                {responsesView === 'responses' ? (
                  responsesLoading ? (
                    <div className="tf-loading">Loading responses...</div>
                  ) : responsesError ? (
                    <div className="tf-error">{responsesError}</div>
                  ) : responses.length === 0 ? (
                    <div className="tf-empty-state">No responses yet.</div>
                  ) : (
                    <div className="tf-responses-table-wrapper">
                      <table className="tf-responses-table">
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>Date</th>
                            {selectedForm.questions.map((q, idx) => (
                              <th key={q.id || idx}>{q.label}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {responses
                            .filter(resp =>
                              responsesSearch.trim() === '' ||
                              selectedForm.questions.some(q => {
                                const ans = resp.answers[q.id];
                                return (Array.isArray(ans) ? ans.join(' ') : (ans || '')).toLowerCase().includes(responsesSearch.toLowerCase());
                              })
                            )
                            .map((resp, idx) => (
                              <tr key={resp._id || idx}>
                                <td>{idx + 1}</td>
                                <td>{new Date(resp.submittedAt).toLocaleString()}</td>
                                {selectedForm.questions.map((q, qidx) => (
                                  <td key={q.id || qidx}>{Array.isArray(resp.answers[q.id]) ? resp.answers[q.id].join('; ') : (resp.answers[q.id] || '—')}</td>
                                ))}
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  )
                ) : (
                  respondersLoading ? (
                    <div className="tf-loading">Loading responders...</div>
                  ) : respondersError ? (
                    <div className="tf-error">{respondersError}</div>
                  ) : responders.length === 0 ? (
                    <div className="tf-empty-state">No one has responded yet.</div>
                  ) : (
                    <ul className="tf-responder-list">
                      {responders
                        .filter(email => email.toLowerCase().includes(responsesSearch.toLowerCase()))
                        .map((email, idx) => (
                          <li key={email} className="tf-responder-item">{email}</li>
                        ))}
                    </ul>
                  )
                )}
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="tf-tabs">
              <div className="tf-tab active">Forms</div>
              <div className="tf-tab">Integrations</div>
              <div className="tf-tab">Brand kit</div>
            </div>
            {/* Workspace Title & Controls */}
            <div className="tf-workspace-header">
              <div className="tf-workspace-title">{selectedWorkspace?.name || 'Workspace'}</div>
              <div className="tf-workspace-actions">
                <button className="tf-invite-btn" onClick={openInviteModal}>Invite</button>
                <button className="tf-visibility-btn" title="Workspace visibility">
                  <svg width="20" height="20" fill="none" viewBox="0 0 20 20"><circle cx="10" cy="10" r="9" stroke="#6B7280" strokeWidth="2"/><circle cx="10" cy="10" r="3" fill="#6B7280"/></svg>
                </button>
                <select className="tf-sort-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                  <option value="date">Date created</option>
                  <option value="title">Title</option>
                </select>
                <div className="tf-view-toggle">
                  <button className={viewMode === 'list' ? 'active' : ''} onClick={() => setViewMode('list')}>List</button>
                  <button className={viewMode === 'grid' ? 'active' : ''} onClick={() => setViewMode('grid')}>Grid</button>
                </div>
              </div>
            </div>
            {/* Forms List/Grid */}
            <div className={viewMode === 'list' ? 'tf-forms-list' : 'tf-forms-grid'}>
              {loading ? (
                <div className="tf-loading">Loading...</div>
              ) : error ? (
                <div className="tf-error">{error}</div>
              ) : sortedForms.length === 0 ? (
                <div className="tf-empty-state">No forms yet.</div>
              ) : (
                sortedForms.map(form => (
                  <div className="tf-form-row" key={form._id}>
                    <div className="tf-form-icon">
                      <div
                        className="tf-form-avatar"
                        onClick={() => setSelectedForm(form)}
                        style={{ cursor: 'pointer' }}
                        title="View Insights"
                      >
                        {form.title?.charAt(0)?.toUpperCase() || 'F'}
                      </div>
                    </div>
                    <div className="tf-form-info">
                      <div className="tf-form-title">
                        {form.title}
                      </div>
                      <div className="tf-form-meta">{formatDate(form.createdAt)}</div>
                    </div>
                    <div className="tf-form-actions">
                      <span className={`tf-form-status ${form.isActive ? 'open' : 'closed'}`}>{form.isActive ? 'Open' : 'Closed'}</span>
                      <button className="tf-form-copy-btn" onClick={e => { e.stopPropagation(); handleCopyLink(form._id); }}>Copy Link</button>
                      <span className="tf-form-meta">{formatDate(form.updatedAt)}</span>
                      <div style={{ position: 'relative', display: 'inline-block' }}>
                        <button
                          className="tf-form-more-btn"
                          onClick={e => { e.stopPropagation(); setOpenMenuFormId(openMenuFormId === form._id ? null : form._id); }}
                        >...</button>
                        {openMenuFormId === form._id && (
                          <div className="tf-form-card-menu" ref={menuRef} onClick={e => e.stopPropagation()}>
                            <button onClick={() => handleRename(form)}>Rename</button>
                            <button onClick={() => handleOpenClose(form)}>
                              {form.isActive ? 'Close' : 'Open'}
                            </button>
                            <button onClick={() => deleteForm(form._id)}>Delete</button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </main>
      {/* Elegant Rename Modal */}
      {showRenameModal && (
        <div className="tf-modal-overlay" onClick={handleRenameCancel}>
          <div className="tf-modal" onClick={e => e.stopPropagation()}>
            <h3>Rename Form</h3>
            <input
              className="tf-modal-input"
              type="text"
              value={renameValue}
              onChange={e => setRenameValue(e.target.value)}
              autoFocus
            />
            <div className="tf-modal-actions">
              <button className="tf-modal-btn tf-modal-cancel" onClick={handleRenameCancel}>Cancel</button>
              <button className="tf-modal-btn tf-modal-save" onClick={handleRenameSave} disabled={!renameValue.trim() || renameValue === renameForm?.title}>Save</button>
            </div>
          </div>
        </div>
      )}
      {/* Status Confirmation Modal */}
      {showStatusModal && (
        <div className="tf-modal-overlay" onClick={handleStatusCancel}>
          <div className="tf-modal" onClick={e => e.stopPropagation()}>
            <h3>Confirm Status Change</h3>
            <p>Are you sure you want to {statusForm?.isActive ? 'close' : 'open'} this form to responses?</p>
            <div className="tf-modal-actions">
              <button className="tf-modal-btn tf-modal-cancel" onClick={handleStatusCancel}>Cancel</button>
              <button className="tf-modal-btn tf-modal-save" onClick={handleStatusConfirm}>{statusForm?.isActive ? 'Close' : 'Open'}</button>
            </div>
          </div>
        </div>
      )}
      {/* Invite Modal */}
      {showInviteModal && (
        <div className="tf-modal-overlay" onClick={closeInviteModal}>
          <div className="tf-modal" onClick={e => e.stopPropagation()}>
            <h3>Invite Collaborators</h3>
            {inviteStep === 1 && (
              <>
                <label htmlFor="invite-form-select">Select a form:</label>
                <select
                  id="invite-form-select"
                  value={inviteFormId}
                  onChange={e => handleFormSelectForInvite(e.target.value)}
                  className="tf-modal-input"
                >
                  <option value="">-- Select a form --</option>
                  {forms.map(form => (
                    <option key={form._id} value={form._id}>{form.title}</option>
                  ))}
                </select>
              </>
            )}
            {inviteStep === 2 && inviteForm && (
              <>
                <div style={{ marginBottom: '1rem' }}>
                  <strong>Form:</strong> {inviteForm.title}
                </div>
                <div className="tf-collaborators-list">
                  <strong style={{ fontSize: '1rem', color: '#000000', fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>
                    Current collaborators:
                  </strong>
                  {collaborators.length === 0 && <span style={{ color: '#b91c1c' }}>No collaborators yet.</span>}
                  {collaborators.map(email => (
                    <span key={email} className="tf-collaborator-pill">
                      <span className="tf-collab-avatar">{email.charAt(0).toUpperCase()}</span>
                      {email}
                      {(user && email !== user.email) && (
                        <button className="tf-collab-remove" title="Remove" onClick={() => handleRemoveCollaborator(email)}>&times;</button>
                      )}
                    </span>
                  ))}
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label htmlFor="invite-emails">Add collaborators (comma-separated emails):</label>
                  <input
                    id="invite-emails"
                    className="tf-modal-input"
                    type="text"
                    value={inviteEmails}
                    onChange={e => setInviteEmails(e.target.value)}
                    placeholder="email1@example.com, email2@example.com"
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', marginTop: '0.7rem' }}>
                    <button className="tf-modal-btn tf-modal-save" onClick={handleAddCollaborators} disabled={inviteLoading}>Add</button>
                    <button className="tf-modal-btn tf-modal-cancel" style={{ background: '#e6fbe6', color: '#1a7f37', border: '1.5px solid #b6e7b6' }} onClick={handleGenerateCollabLink} disabled={collabLinkLoading}>Generate Collaboration Link</button>
                  </div>
                </div>
                {collabLink && (
                  <div style={{ display: 'flex', alignItems: 'center', marginTop: '0.7rem', gap: '0.5rem' }}>
                    <input type="text" className="tf-modal-input" value={collabLink} readOnly style={{ flex: 1, marginBottom: 0 }} />
                    <button className="tf-modal-btn tf-modal-save" style={{ padding: '0.5em 1em', fontSize: '0.95em' }} onClick={handleCopyCollabLink}>Copy</button>
                  </div>
                )}
                {collabLinkError && <div style={{ color: '#b91c1c', marginTop: '0.5rem' }}>{collabLinkError}</div>}
                <button className="tf-modal-btn tf-modal-cancel" onClick={closeInviteModal}>Done</button>
              </>
            )}
            {inviteError && <div style={{ color: '#b91c1c', marginTop: '0.7rem' }}>{inviteError}</div>}
            {inviteLoading && <div className="tf-loading">Loading...</div>}
          </div>
        </div>
      )}
      {/* Workspace Modal */}
      {showWorkspaceModal && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.18)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: '2rem 2.5rem', minWidth: 320, boxShadow: '0 8px 32px rgba(44,62,80,0.18)' }}>
            <h3 style={{ fontWeight: 800, fontSize: 20, marginBottom: 18 }}>Create Workspace</h3>
            <input
              type="text"
              value={newWorkspaceName}
              onChange={e => setNewWorkspaceName(e.target.value)}
              placeholder="Workspace name"
              style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: 8, border: '1.5px solid #d1d5db', fontSize: 16, marginBottom: 18 }}
            />
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowWorkspaceModal(false)} style={{ background: '#f3f4f6', color: '#18181b', border: 'none', borderRadius: 8, padding: '0.6rem 1.2rem', fontWeight: 600 }}>Cancel</button>
              <button onClick={handleCreateWorkspace} style={{ background: '#18181b', color: '#fff', border: 'none', borderRadius: 8, padding: '0.6rem 1.2rem', fontWeight: 600 }}>Create</button>
            </div>
          </div>
        </div>
      )}
      {/* Workspace Selection Modal */}
      {showCreateFormModal && (
        <div className="tf-modal-overlay" onClick={() => setShowCreateFormModal(false)}>
          <div className="tf-modal" onClick={e => e.stopPropagation()}>
            <h3>Select Workspace</h3>
            <select
              className="tf-modal-input"
              value={selectedWorkspaceForForm?._id || ''}
              onChange={e => setSelectedWorkspaceForForm(workspaces.find(ws => ws._id === e.target.value))}
            >
              {workspaces.map(ws => (
                <option key={ws._id} value={ws._id}>{ws.name}</option>
              ))}
            </select>
            <div className="tf-modal-actions" style={{ marginTop: 18 }}>
              <button className="tf-modal-btn tf-modal-cancel" onClick={() => setShowCreateFormModal(false)}>Cancel</button>
              <button className="tf-modal-btn tf-modal-save" onClick={handleConfirmCreateForm} disabled={!selectedWorkspaceForForm}>Continue</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard; 