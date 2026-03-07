import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import {
  Users,
  UserPlus,
  MessageCircle,
  Loader2,
  Play,
  CheckCircle,
  LogOut,
  MoreVertical,
  Phone,
  Mail,
  Building,
  DollarSign,
  Calendar,
  StickyNote,
  X,
  ChevronRight
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const PIPELINE_STAGES = [
  { id: 'new_lead', label: 'New Lead', icon: UserPlus, color: 'bg-blue-100 text-blue-700' },
  { id: 'contacted', label: 'Contacted', icon: MessageCircle, color: 'bg-yellow-100 text-yellow-700' },
  { id: 'onboarding', label: 'Onboarding', icon: Loader2, color: 'bg-purple-100 text-purple-700' },
  { id: 'active_pilot', label: 'Active Pilot', icon: Play, color: 'bg-green-100 text-green-700' },
  { id: 'completed', label: 'Completed', icon: CheckCircle, color: 'bg-gray-100 text-gray-700' },
];

const REVENUE_LABELS = {
  under_3k: 'Under $3K',
  '3k_to_5k': '$3K - $5K',
  '5k_to_10k': '$5K - $10K',
  over_10k: 'Over $10K',
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, token, logout, loading: authLoading } = useAuth();
  const [stats, setStats] = useState(null);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !token) {
      navigate('/admin/login');
    }
  }, [token, authLoading, navigate]);

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token]);

  const fetchData = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [statsRes, clientsRes] = await Promise.all([
        axios.get(`${API}/dashboard/stats`, { headers }),
        axios.get(`${API}/clients`, { headers }),
      ]);
      setStats(statsRes.data);
      setClients(clientsRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      if (error.response?.status === 401) {
        logout();
        navigate('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const updateClientStage = async (clientId, newStage) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.put(`${API}/clients/${clientId}`, 
        { pipeline_stage: newStage },
        { headers }
      );
      toast.success('Client updated');
      fetchData();
    } catch (error) {
      toast.error('Failed to update client');
    }
  };

  const updateClientNotes = async (clientId, notes) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.put(`${API}/clients/${clientId}`, 
        { notes },
        { headers }
      );
      toast.success('Notes saved');
      fetchData();
    } catch (error) {
      toast.error('Failed to save notes');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const openClientDetail = (client) => {
    setSelectedClient(client);
    setIsDetailOpen(true);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="flex items-center gap-3 text-forest">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="font-medium">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  const getClientsByStage = (stageId) => {
    return clients.filter(c => c.pipeline_stage === stageId);
  };

  return (
    <div className="min-h-screen bg-cream-subtle" data-testid="admin-dashboard">
      {/* Header */}
      <header className="bg-white border-b border-[#E5E5E0] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-forest flex items-center justify-center">
                <span className="text-white font-heading font-bold text-lg">A</span>
              </div>
              <div>
                <h1 className="font-heading text-xl font-semibold text-gray-900">Pipeline Dashboard</h1>
                <p className="text-xs text-gray-500">Aveonel Global</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Welcome, <span className="font-medium">{user?.name || 'Admin'}</span>
              </span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout}
                className="gap-2"
                data-testid="logout-btn"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-4 border border-[#E5E5E0]"
            >
              <p className="text-sm text-gray-500 mb-1">Total Leads</p>
              <p className="text-2xl font-semibold text-gray-900" data-testid="stat-total">{stats.total_leads}</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="bg-blue-50 rounded-xl p-4 border border-blue-100"
            >
              <p className="text-sm text-blue-600 mb-1">New Leads</p>
              <p className="text-2xl font-semibold text-blue-700" data-testid="stat-new">{stats.new_leads}</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-yellow-50 rounded-xl p-4 border border-yellow-100"
            >
              <p className="text-sm text-yellow-600 mb-1">Contacted</p>
              <p className="text-2xl font-semibold text-yellow-700" data-testid="stat-contacted">{stats.contacted}</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-purple-50 rounded-xl p-4 border border-purple-100"
            >
              <p className="text-sm text-purple-600 mb-1">Onboarding</p>
              <p className="text-2xl font-semibold text-purple-700" data-testid="stat-onboarding">{stats.onboarding}</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-green-50 rounded-xl p-4 border border-green-100"
            >
              <p className="text-sm text-green-600 mb-1">Active Pilots</p>
              <p className="text-2xl font-semibold text-green-700" data-testid="stat-active">{stats.active_pilots}</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-forest/10 rounded-xl p-4 border border-forest/20"
            >
              <p className="text-sm text-forest mb-1">Spots Left</p>
              <p className="text-2xl font-semibold text-forest" data-testid="stat-spots">{stats.pilot_spots_remaining}/10</p>
            </motion.div>
          </div>
        )}

        {/* Kanban Board */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto">
          {PIPELINE_STAGES.map((stage, index) => (
            <motion.div
              key={stage.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-xl border border-[#E5E5E0] min-h-[400px]"
            >
              {/* Column Header */}
              <div className="p-4 border-b border-[#E5E5E0]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <stage.icon className="w-4 h-4 text-gray-500" />
                    <span className="font-medium text-gray-900">{stage.label}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {getClientsByStage(stage.id).length}
                  </Badge>
                </div>
              </div>
              
              {/* Cards */}
              <div className="p-3 space-y-3">
                {getClientsByStage(stage.id).map((client) => (
                  <motion.div
                    key={client.id}
                    layout
                    className="bg-cream rounded-lg p-3 border border-[#E5E5E0] cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => openClientDetail(client)}
                    data-testid={`client-card-${client.id}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-900 text-sm">{client.name}</h4>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <MoreVertical className="w-3 h-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {PIPELINE_STAGES.filter(s => s.id !== stage.id).map((s) => (
                            <DropdownMenuItem 
                              key={s.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                updateClientStage(client.id, s.id);
                              }}
                            >
                              Move to {s.label}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">{client.business_type}</p>
                    <Badge className={`text-xs ${stage.color}`}>
                      {REVENUE_LABELS[client.revenue_range] || client.revenue_range}
                    </Badge>
                  </motion.div>
                ))}
                
                {getClientsByStage(stage.id).length === 0 && (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    No clients
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </main>

      {/* Client Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl">{selectedClient?.name}</DialogTitle>
          </DialogHeader>
          
          {selectedClient && (
            <div className="space-y-6">
              {/* Contact Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <a href={`mailto:${selectedClient.email}`} className="text-forest hover:underline">
                    {selectedClient.email}
                  </a>
                </div>
                {selectedClient.phone && (
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <a href={`tel:${selectedClient.phone}`} className="text-gray-700">
                      {selectedClient.phone}
                    </a>
                  </div>
                )}
                <div className="flex items-center gap-3 text-sm">
                  <Building className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-700">{selectedClient.business_type}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <DollarSign className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-700">{REVENUE_LABELS[selectedClient.revenue_range]}/month</span>
                </div>
              </div>

              {/* Stage Selector */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Pipeline Stage</label>
                <Select 
                  value={selectedClient.pipeline_stage}
                  onValueChange={(value) => {
                    updateClientStage(selectedClient.id, value);
                    setSelectedClient({ ...selectedClient, pipeline_stage: value });
                  }}
                >
                  <SelectTrigger data-testid="stage-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PIPELINE_STAGES.map((stage) => (
                      <SelectItem key={stage.id} value={stage.id}>
                        {stage.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Notes */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Notes</label>
                <Textarea
                  defaultValue={selectedClient.notes || ''}
                  placeholder="Add notes about this client..."
                  className="min-h-[100px]"
                  onBlur={(e) => {
                    if (e.target.value !== selectedClient.notes) {
                      updateClientNotes(selectedClient.id, e.target.value);
                    }
                  }}
                  data-testid="client-notes"
                />
              </div>

              {/* Timestamps */}
              <div className="text-xs text-gray-400 flex items-center gap-2">
                <Calendar className="w-3 h-3" />
                <span>Added {new Date(selectedClient.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
