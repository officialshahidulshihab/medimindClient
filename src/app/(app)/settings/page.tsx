'use client';

import { useState, useEffect } from 'react';
import { useSession, authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import AuthGuard from '@/components/auth-guard';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { User, Shield, Activity, Bell, AlertTriangle, CheckCircle, X, LogOut, LayoutDashboard } from 'lucide-react';
import { useToast } from '@/components/ui/toast';

// Reusable Tag Input
function TagInput({ label, tags, setTags }: { label: string, tags: string[], setTags: (tags: string[]) => void }) {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = inputValue.trim().replace(',', '');
      if (val && !tags.includes(val)) {
        setTags([...tags, val]);
      }
      setInputValue('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div>
      <label className="block text-sm font-medium text-white mb-2">{label}</label>
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag, i) => (
          <div key={i} className="flex items-center gap-1 bg-[#0EA5A0]/10 text-[#0EA5A0] px-3 py-1.5 rounded-md text-sm border border-[#0EA5A0]/20">
            {tag}
            <button type="button" onClick={() => removeTag(tag)} className="hover:text-white transition-colors ml-1">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type and press Enter"
        className="w-full bg-[#0F1A2E] border border-[#64748B]/30 rounded-md p-3 text-white focus:outline-none focus:border-[#0EA5A0] text-sm"
      />
    </div>
  );
}

export default function SettingsPage() {
  return (
    <AuthGuard>
      <SettingsContent />
    </AuthGuard>
  );
}

function SettingsContent() {
  const { data: session, isPending: sessionLoading } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState('profile');
  const toast = useToast();
  const showToast = (message: string, type: 'success' | 'error') => {
    if (type === 'success') toast.success(message);
    else toast.error(message);
  };

  // Profile Form State
  const [name, setName] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  // Security Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Health Profile State
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [bloodType, setBloodType] = useState('');
  const [allergies, setAllergies] = useState<string[]>([]);
  const [chronicConditions, setChronicConditions] = useState<string[]>([]);
  const [currentMedications, setCurrentMedications] = useState<string[]>([]);

  // Notifications State (Local Storage)
  const [notifications, setNotifications] = useState({
    email: true,
    appointments: true,
    tips: false
  });

  // Danger Zone
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || '');
      setImageUrl(session.user.image || '');
    }
    
    // Load notifications from local storage
    const saved = localStorage.getItem('notification_preferences');
    if (saved) {
      try {
        setNotifications(JSON.parse(saved));
      } catch (e) {}
    }
  }, [session]);

  const handleNotificationToggle = async (key: keyof typeof notifications) => {
    const newSettings = { ...notifications, [key]: !notifications[key] };
    setNotifications(newSettings);
    localStorage.setItem('notification_preferences', JSON.stringify(newSettings));
    showToast('Notification preferences updated', 'success');

    try {
      await authClient.updateUser({
        data: {
          notif_email: newSettings.email,
          notif_appointments: newSettings.appointments,
          notif_tips: newSettings.tips
        }
      } as any);
    } catch (e) {
      // Fallback
      api.patch('/auth/update-user', newSettings).catch(() => {});
    }
  };

  const role = (session?.user as any)?.role || 'patient';
  const isPatient = role === 'patient';

  const { data: healthProfile, isLoading: healthProfileLoading } = useQuery({
    queryKey: ['health-profile'],
    queryFn: async () => {
      const res = await api.get('/health-profile');
      return res.data.data;
    },
    enabled: isPatient && !!session?.user
  });

  useEffect(() => {
    if (healthProfile && Object.keys(healthProfile).length > 0) {
      setAge(healthProfile.age?.toString() || '');
      setGender(healthProfile.gender || '');
      setBloodType(healthProfile.bloodType || '');
      setAllergies(healthProfile.allergies || []);
      setChronicConditions(healthProfile.chronicConditions || []);
      setCurrentMedications(healthProfile.currentMedications || []);
    }
  }, [healthProfile]);

  const updateProfileMutation = useMutation({
    mutationFn: async () => {
      const res = await authClient.updateUser({ name, image: imageUrl });
      if (res.error) throw new Error(res.error.message || 'Failed to update profile');
      return res.data;
    },
    onSuccess: () => {
      showToast('Profile updated successfully', 'success');
    },
    onError: (error: any) => {
      showToast(error.message || 'Error updating profile', 'error');
    }
  });

  const changePasswordMutation = useMutation({
    mutationFn: async () => {
      if (newPassword !== confirmPassword) throw new Error("Passwords do not match");
      const res = await authClient.changePassword({ newPassword, currentPassword, revokeOtherSessions: true });
      if (res.error) throw new Error(res.error.message || 'Failed to change password');
    },
    onSuccess: () => {
      showToast('Password changed successfully', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    },
    onError: (error: any) => {
      showToast(error.message || 'Error changing password', 'error');
    }
  });

  const updateHealthProfileMutation = useMutation({
    mutationFn: async () => {
      await api.post('/health-profile', {
        age: Number(age) || undefined,
        gender,
        bloodType,
        allergies,
        chronicConditions,
        currentMedications
      });
    },
    onSuccess: () => {
      showToast('Health profile updated successfully', 'success');
      queryClient.invalidateQueries({ queryKey: ['health-profile'] });
    },
    onError: (error: any) => {
      showToast(error.response?.data?.message || 'Error updating health profile', 'error');
    }
  });

  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      const res = await api.delete('/users/me');
      return res.data;
    },
    onSuccess: async () => {
      await authClient.signOut();
      router.push('/');
    },
    onError: (error: any) => {
      showToast(error.message || 'Error deleting account', 'error');
      setShowDeleteModal(false);
      setDeleteConfirmText('');
    }
  });

  if (sessionLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner className="w-8 h-8 text-[#0EA5A0]" />
      </div>
    );
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <User size={18} /> },
    { id: 'security', label: 'Security', icon: <Shield size={18} /> },
    ...(isPatient ? [{ id: 'health', label: 'Health Profile', icon: <Activity size={18} /> }] : []),
    { id: 'notifications', label: 'Notifications', icon: <Bell size={18} /> },
    { id: 'danger', label: 'Danger Zone', icon: <AlertTriangle size={18} /> },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-[#64748B] hover:text-[#0EA5A0] transition-colors"
        >
          ← Back to Dashboard
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-[#64748B]">Manage your account preferences and personal information.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Navigation */}
        <div className="md:w-64 flex-shrink-0">
          <div className="flex md:flex-col overflow-x-auto hide-scrollbar bg-[#1A2942] rounded-xl border border-[#64748B]/20 md:p-3">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 md:py-3 md:px-4 text-sm font-medium transition-colors rounded-lg whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-[#0EA5A0]/10 text-[#0EA5A0]'
                    : 'text-[#64748B] hover:bg-[#64748B]/10 hover:text-white'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 bg-[#1A2942] rounded-xl border border-[#64748B]/20 p-6 md:p-8 min-h-[500px]">
          
          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <div className="animate-in fade-in duration-300">
              <h2 className="text-xl font-bold text-white mb-6">Profile Settings</h2>
              
              <div className="flex items-center gap-6 mb-8">
                <div className="w-24 h-24 rounded-full bg-[#0F1A2E] border-2 border-[#64748B]/30 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {imageUrl ? (
                    <img src={imageUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User size={40} className="text-[#64748B]" />
                  )}
                </div>
                <div>
                  <h3 className="text-white font-medium mb-1">Profile Avatar</h3>
                  <p className="text-[#64748B] text-sm mb-3">Provide a URL for your avatar image.</p>
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://example.com/avatar.jpg"
                    className="w-full max-w-sm bg-[#0F1A2E] border border-[#64748B]/30 rounded-md p-2 text-white focus:outline-none focus:border-[#0EA5A0] text-sm"
                  />
                </div>
              </div>

              <div className="space-y-5 max-w-xl">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#0F1A2E] border border-[#64748B]/30 rounded-md p-3 text-white focus:outline-none focus:border-[#0EA5A0] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Email Address</label>
                  <input
                    type="email"
                    value={session?.user?.email || ''}
                    readOnly
                    className="w-full bg-[#0F1A2E] border border-[#64748B]/30 rounded-md p-3 text-[#64748B] cursor-not-allowed text-sm opacity-70"
                  />
                  <p className="text-xs text-[#64748B] mt-1">Email cannot be changed.</p>
                </div>
                
                <button
                  onClick={() => updateProfileMutation.mutate()}
                  disabled={updateProfileMutation.isPending}
                  className="px-6 py-2.5 bg-[#0EA5A0] text-white font-medium rounded-md hover:bg-[#0EA5A0]/90 transition-colors disabled:opacity-50 flex items-center mt-4"
                >
                  {updateProfileMutation.isPending && <LoadingSpinner className="mr-2 w-4 h-4 text-white" />}
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {/* SECURITY TAB */}
          {activeTab === 'security' && (
            <div className="animate-in fade-in duration-300">
              <h2 className="text-xl font-bold text-white mb-6">Security Settings</h2>
              
              <div className="space-y-5 max-w-xl">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full bg-[#0F1A2E] border border-[#64748B]/30 rounded-md p-3 text-white focus:outline-none focus:border-[#0EA5A0] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-[#0F1A2E] border border-[#64748B]/30 rounded-md p-3 text-white focus:outline-none focus:border-[#0EA5A0] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-[#0F1A2E] border border-[#64748B]/30 rounded-md p-3 text-white focus:outline-none focus:border-[#0EA5A0] text-sm"
                  />
                </div>
                
                <button
                  onClick={() => changePasswordMutation.mutate()}
                  disabled={changePasswordMutation.isPending || !currentPassword || !newPassword || !confirmPassword}
                  className="px-6 py-2.5 bg-[#0EA5A0] text-white font-medium rounded-md hover:bg-[#0EA5A0]/90 transition-colors disabled:opacity-50 flex items-center mt-4"
                >
                  {changePasswordMutation.isPending && <LoadingSpinner className="mr-2 w-4 h-4 text-white" />}
                  Update Password
                </button>
              </div>
            </div>
          )}

          {/* HEALTH PROFILE TAB */}
          {activeTab === 'health' && isPatient && (
            <div className="animate-in fade-in duration-300">
              <h2 className="text-xl font-bold text-white mb-6">Health Profile</h2>
              {healthProfileLoading ? (
                <div className="py-10 flex justify-center"><LoadingSpinner className="w-6 h-6 text-[#0EA5A0]" /></div>
              ) : (
                <div className="space-y-6 max-w-2xl">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Age</label>
                      <input
                        type="number"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        className="w-full bg-[#0F1A2E] border border-[#64748B]/30 rounded-md p-3 text-white focus:outline-none focus:border-[#0EA5A0] text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Gender</label>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="w-full bg-[#0F1A2E] border border-[#64748B]/30 rounded-md p-3 text-white focus:outline-none focus:border-[#0EA5A0] text-sm"
                        style={{ colorScheme: 'dark' }}
                      >
                        <option value="">Select gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                        <option value="Prefer not to say">Prefer not to say</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Blood Type</label>
                      <select
                        value={bloodType}
                        onChange={(e) => setBloodType(e.target.value)}
                        className="w-full bg-[#0F1A2E] border border-[#64748B]/30 rounded-md p-3 text-white focus:outline-none focus:border-[#0EA5A0] text-sm"
                        style={{ colorScheme: 'dark' }}
                      >
                        <option value="">Select blood type</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                        <option value="Unknown">Unknown</option>
                      </select>
                    </div>
                  </div>

                  <div className="border-t border-[#64748B]/20 pt-6 space-y-6">
                    <TagInput label="Allergies" tags={allergies} setTags={setAllergies} />
                    <TagInput label="Chronic Conditions" tags={chronicConditions} setTags={setChronicConditions} />
                    <TagInput label="Current Medications" tags={currentMedications} setTags={setCurrentMedications} />
                  </div>

                  <button
                    onClick={() => updateHealthProfileMutation.mutate()}
                    disabled={updateHealthProfileMutation.isPending}
                    className="px-6 py-2.5 bg-[#0EA5A0] text-white font-medium rounded-md hover:bg-[#0EA5A0]/90 transition-colors disabled:opacity-50 flex items-center mt-4"
                  >
                    {updateHealthProfileMutation.isPending && <LoadingSpinner className="mr-2 w-4 h-4 text-white" />}
                    Save Health Profile
                  </button>
                </div>
              )}
            </div>
          )}

          {/* NOTIFICATIONS TAB */}
          {activeTab === 'notifications' && (
            <div className="animate-in fade-in duration-300">
              <h2 className="text-xl font-bold text-white mb-6">Notification Preferences</h2>
              <div className="space-y-4 max-w-xl">
                
                {[
                  { key: 'email', title: 'Email Notifications', desc: 'Receive important account updates via email.' },
                  { key: 'appointments', title: 'Appointment Reminders', desc: 'Get notified 24h before an upcoming appointment.' },
                  { key: 'tips', title: 'Health Tips', desc: 'Receive personalized health tips based on your profile.' },
                ].map((item) => {
                  const isActive = notifications[item.key as keyof typeof notifications];
                  return (
                    <div key={item.key} className="flex items-center justify-between p-4 bg-[#0F1A2E] rounded-xl border border-[#64748B]/30">
                      <div>
                        <h3 className="text-white font-medium text-sm mb-1">{item.title}</h3>
                        <p className="text-[#64748B] text-xs">{item.desc}</p>
                      </div>
                      <button
                        onClick={() => handleNotificationToggle(item.key as keyof typeof notifications)}
                        className={`w-11 h-6 rounded-full transition-colors relative flex items-center ${isActive ? 'bg-[#0EA5A0]' : 'bg-[#64748B]/40'}`}
                      >
                        <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>
                  );
                })}

              </div>
            </div>
          )}

          {/* DANGER ZONE TAB */}
          {activeTab === 'danger' && (
            <div className="animate-in fade-in duration-300">
              <h2 className="text-xl font-bold text-red-500 mb-6">Danger Zone</h2>
              
              <div className="border border-red-500/30 bg-red-500/5 rounded-xl p-6 max-w-xl">
                <h3 className="text-white font-medium mb-2">Delete Account</h3>
                <p className="text-[#64748B] text-sm mb-6">
                  Once you delete your account, there is no going back. Please be certain. All your data, health records, and appointments will be permanently erased.
                </p>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="px-4 py-2 border border-red-500/50 text-red-400 font-medium rounded-md hover:bg-red-500/10 transition-colors"
                >
                  Delete Account
                </button>
              </div>

              {showDeleteModal && (
                <div 
                  className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
                  onClick={() => setShowDeleteModal(false)}
                >
                  <div 
                    className="bg-[#1A2942] rounded-xl border border-[#64748B]/20 w-full max-w-md p-6"
                    onClick={e => e.stopPropagation()}
                  >
                    <div className="flex items-center gap-3 text-red-500 mb-4">
                      <AlertTriangle size={24} />
                      <h2 className="text-xl font-bold text-white">Delete Account</h2>
                    </div>
                    <p className="text-[#64748B] text-sm mb-6">
                      This action cannot be undone. To confirm, please type <strong className="text-white">DELETE</strong> below.
                    </p>
                    <input
                      type="text"
                      value={deleteConfirmText}
                      onChange={(e) => setDeleteConfirmText(e.target.value)}
                      placeholder="DELETE"
                      className="w-full bg-[#0F1A2E] border border-red-500/30 rounded-md p-3 text-white focus:outline-none focus:border-red-500 text-sm mb-6"
                    />
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => setShowDeleteModal(false)}
                        className="px-4 py-2 text-[#64748B] hover:text-white transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => deleteAccountMutation.mutate()}
                        disabled={deleteConfirmText !== 'DELETE' || deleteAccountMutation.isPending}
                        className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center"
                      >
                        {deleteAccountMutation.isPending && <LoadingSpinner className="w-4 h-4 mr-2" />}
                        Permanently Delete
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
