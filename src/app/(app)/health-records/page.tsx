'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import Link from 'next/link';
import { FileText, Activity, Pill, Upload, Trash2, Cpu, AlertTriangle, CheckCircle, Search, ArrowLeft, ScanLine, ExternalLink, Calendar, Bookmark } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DoctorCard } from '@/components/ui/doctor-card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { format } from 'date-fns';

import AuthGuard from "@/components/auth-guard";
import { useToast } from '@/components/ui/toast';

export interface HealthDocument {
  _id: string;
  type: string;
  fileName: string;
  fileUrl: string;
  aiSummary?: string;
  extractedData?: Record<string, string>;
  abnormalFlags: string[];
  actionItems: string[];
  documentDate?: string;
  createdAt: string;
}

export async function fetchDocuments(): Promise<HealthDocument[]> {
  const res = await api.get('/health-documents');
  return res.data.data;
}

export async function uploadDocument(
  file: File,
  type: string,
  documentDate?: string
): Promise<HealthDocument> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', type);
  if (documentDate) formData.append('documentDate', documentDate);
  const res = await api.post('/health-documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data.data;
}

export async function analyzeDocument(documentId: string): Promise<HealthDocument> {
  const res = await api.post('/ai/analyze-document', { documentId });
  return res.data.data;
}

export async function deleteDocument(id: string): Promise<void> {
  await api.delete(`/health-documents/${id}`);
}

export default function HealthRecordsPage() {
  return (
    <AuthGuard>
      <HealthRecordsContent />
    </AuthGuard>
  );
}

function HealthRecordsContent() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'documents' | 'symptoms' | 'drugs' | 'appointments' | 'saved'>('documents');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();
  
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadType, setUploadType] = useState('Lab Report');
  const [uploadDate, setUploadDate] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<HealthDocument | null>(null);
  const [analyzeError, setAnalyzeError] = useState('');

  const { data: documents, isLoading: isLoadingDocs } = useQuery({
    queryKey: ['health-documents'],
    queryFn: fetchDocuments,
    enabled: !!session && activeTab === 'documents'
  });

  const { data: symptoms, isLoading: isLoadingSymptoms } = useQuery({
    queryKey: ['symptom-sessions'],
    queryFn: async () => {
      const res = await api.get('/symptom-sessions');
      return res.data.data as any[];
    },
    enabled: !!session && activeTab === 'symptoms'
  });

  const { data: drugs, isLoading: isLoadingDrugs } = useQuery({
    queryKey: ['drug-checks'],
    queryFn: async () => {
      const res = await api.get('/drug-checks');
      return res.data.data as any[];
    },
    enabled: !!session && activeTab === 'drugs'
  });

  const { data: appointments, isLoading: isLoadingAppointments } = useQuery({
    queryKey: ['my-appointments'],
    queryFn: async () => {
      const res = await api.get('/appointments');
      return res.data.data as any[];
    },
    enabled: !!session && activeTab === 'appointments'
  });

  const { data: bookmarks, isLoading: isLoadingBookmarks } = useQuery({
    queryKey: ['my-bookmarks'],
    queryFn: async () => {
      const res = await api.get('/bookmarks');
      return res.data.data as any[];
    },
    enabled: !!session && activeTab === 'saved'
  });

  const toggleBookmarkMutation = useMutation({
    mutationFn: async (doctorId: string) => {
      const res = await api.post('/bookmarks/toggle', { doctorId });
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['my-bookmarks'] });
      if (data.data.bookmarked) {
        toast.success('Doctor saved');
      } else {
        toast.success('Bookmark removed');
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to toggle bookmark');
    }
  });

  const cancelAppointmentMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/appointments/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-appointments'] });
      toast.success('Appointment cancelled');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to cancel appointment');
    }
  });

  const uploadMutation = useMutation({
    mutationFn: ({ file, type, documentDate }: { file: File; type: string; documentDate?: string }) => uploadDocument(file, type, documentDate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['health-documents'] });
      setShowUploadModal(false);
      setUploadError('');
      toast.success('Document uploaded successfully');
    },
    onError: (error: any) => {
      setUploadError(error?.response?.data?.message ?? 'Upload failed. Please try again.');
    }
  });

  const analyzeMutation = useMutation({
    mutationFn: (documentId: string) => analyzeDocument(documentId),
    onSuccess: (updatedDoc) => {
      queryClient.setQueryData(['health-documents'], (old: HealthDocument[] | undefined) =>
        old?.map(d => d._id === updatedDoc._id ? updatedDoc : d) ?? []
      );
      setSelectedDoc(updatedDoc);
    },
    onError: (error: any) => {
      setAnalyzeError(error?.response?.data?.message ?? 'Analysis failed. Please try again.');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteDocument(id),
    onSuccess: (_, id) => {
      queryClient.setQueryData(['health-documents'], (old: HealthDocument[] | undefined) =>
        old?.filter(d => d._id !== id) ?? []
      );
      if (selectedDoc?._id === id) setSelectedDoc(null);
    }
  });

  if (!session) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Back to Website */}
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 transition-colors"
          style={{
            fontSize: '13px',
            fontWeight: 500,
            color: 'var(--text-muted)',
            textDecoration: 'none',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLAnchorElement).style.color = 'var(--teal)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-muted)';
          }}
        >
          <ArrowLeft size={14} />
          Back to Website
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Health Records</h1>
        <p className="text-[#64748B]">Manage your medical documents, symptom history, and drug checks.</p>
      </div>

      <div className="flex border-b border-[#64748B]/30 mb-8 overflow-x-auto hide-scrollbar">
        {[
          { id: 'documents', label: 'Documents', icon: <FileText className="w-4 h-4 mr-2" /> },
          { id: 'symptoms', label: 'Symptom History', icon: <Activity className="w-4 h-4 mr-2" /> },
          { id: 'drugs', label: 'Drug Checks', icon: <Pill className="w-4 h-4 mr-2" /> },
          { id: 'appointments', label: 'Appointments', icon: <Calendar className="w-4 h-4 mr-2" /> },
          { id: 'saved', label: 'Saved Doctors', icon: <Bookmark className="w-4 h-4 mr-2" /> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center px-6 py-4 font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.id 
                ? 'text-[#0EA5A0] border-b-2 border-[#0EA5A0]' 
                : 'text-[#64748B] hover:text-white'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'documents' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">Medical Documents</h2>
            <div>
              <button 
                onClick={() => setShowUploadModal(true)}
                className="px-4 py-2 bg-[#0EA5A0] text-white rounded-md hover:bg-[#0EA5A0]/90 transition-colors flex items-center disabled:opacity-50"
              >
                <Upload className="mr-2 w-4 h-4" />
                Upload Document
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5">
              {isLoadingDocs ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="bg-[#1A2942] rounded-xl p-5 border border-[#64748B]/20 mb-3 flex items-center gap-4">
                    <div style={{
                      width: '44px', height: '44px', borderRadius: '10px',
                      background: 'rgba(255,255,255,0.06)',
                      animation: 'pulse 1.5s ease-in-out infinite',
                      flexShrink: 0,
                    }} />
                    <div style={{ flex: 1 }}>
                      <div style={{
                        height: '14px', width: '160px', borderRadius: '4px',
                        background: 'rgba(255,255,255,0.06)',
                        animation: 'pulse 1.5s ease-in-out infinite',
                        marginBottom: '8px',
                      }} />
                      <div style={{
                        height: '12px', width: '100px', borderRadius: '4px',
                        background: 'rgba(255,255,255,0.04)',
                        animation: 'pulse 1.5s ease-in-out infinite',
                      }} />
                    </div>
                  </div>
                ))
              ) : !documents || documents.length === 0 ? (
                <div className="bg-[#1A2942] rounded-xl p-10 text-center border border-[#64748B]/20">
                  <FileText className="w-12 h-12 text-[#64748B] mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">No documents yet</h3>
                  <p className="text-[#64748B]">Upload lab results or prescriptions to analyze them with AI.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {documents.map((doc: any) => (
                    <div
                      key={doc._id}
                      className="bg-[#1A2942] rounded-xl border transition-colors hover:bg-[#64748B]/5"
                      style={{
                        padding: '20px',
                        cursor: 'pointer',
                        borderColor: selectedDoc?._id === doc._id
                          ? 'var(--teal)'
                          : 'rgba(100, 116, 139, 0.2)',
                      }}
                      onClick={() => setSelectedDoc(doc)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div style={{
                            width: '44px', height: '44px',
                            borderRadius: '10px',
                            background: 'rgba(0,201,177,0.1)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0,
                          }}>
                            <FileText size={20} color="var(--teal)" />
                          </div>
                          <div>
                            <div style={{
                              fontSize: '14px', fontWeight: 600, color: 'white'
                            }}>
                              {doc.fileName}
                            </div>
                            <div style={{
                              fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px'
                            }}>
                              {doc.type} ·{' '}
                              {doc.documentDate
                                ? new Date(doc.documentDate).toLocaleDateString()
                                : new Date(doc.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {doc.aiSummary ? (
                            <span style={{
                              fontSize: '11px', fontWeight: 600,
                              padding: '3px 10px', borderRadius: '9999px',
                              background: 'rgba(0,214,143,0.12)',
                              color: 'var(--success)',
                              border: '1px solid rgba(0,214,143,0.25)',
                            }}>
                              ✓ Analyzed
                            </span>
                          ) : (
                            <span style={{
                              fontSize: '11px', fontWeight: 600,
                              padding: '3px 10px', borderRadius: '9999px',
                              background: 'rgba(255,181,69,0.1)',
                              color: 'var(--warning)',
                              border: '1px solid rgba(255,181,69,0.2)',
                            }}>
                              Pending
                            </span>
                          )}

                          <button
                            onClick={e => {
                              e.stopPropagation();
                              deleteMutation.mutate(doc._id);
                            }}
                            disabled={deleteMutation.isPending}
                            style={{
                              padding: '6px',
                              borderRadius: '6px',
                              background: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              color: 'var(--text-disabled)',
                            }}
                            onMouseEnter={e =>
                              (e.currentTarget.style.color = 'var(--danger)')
                            }
                            onMouseLeave={e =>
                              (e.currentTarget.style.color = 'var(--text-disabled)')
                            }
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="lg:col-span-7">
              {selectedDoc && (
                <div className="bg-[#1A2942] rounded-xl border border-[#64748B]/20 h-full" style={{ padding: '24px' }}>
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'white' }}>
                        {selectedDoc.fileName}
                      </h3>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {selectedDoc.type}
                      </p>
                    </div>
                    
                    <a
                      href={selectedDoc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: '12px',
                        color: 'var(--teal)',
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <ExternalLink size={13} /> View File
                    </a>
                  </div>

                  {!selectedDoc.aiSummary ? (
                    <div className="flex flex-col items-center justify-center gap-4 py-16">
                      <ScanLine size={40} color="var(--text-disabled)" />
                      <p style={{ fontSize: '14px', color: 'var(--text-muted)', textAlign: 'center' }}>
                        This document has not been analyzed yet.
                      </p>
                      {analyzeError && (
                        <div style={{
                          fontSize: '13px', color: 'var(--danger)',
                          padding: '10px 14px',
                          background: 'rgba(255,77,106,0.08)',
                          borderRadius: '8px', width: '100%', textAlign: 'center',
                        }}>
                          {analyzeError}
                        </div>
                      )}
                      <button
                        onClick={() => {
                          setAnalyzeError('');
                          analyzeMutation.mutate(selectedDoc._id);
                        }}
                        disabled={analyzeMutation.isPending}
                        className="px-6 py-3 bg-[#0EA5A0] text-white rounded-md hover:bg-[#0EA5A0]/90 transition-colors font-medium flex items-center justify-center"
                        style={{ height: '44px' }}
                      >
                        {analyzeMutation.isPending ? (
                          <div className="flex items-center gap-2">
                            <LoadingSpinner className="w-4 h-4" />
                            Analyzing with Gemini AI...
                          </div>
                        ) : (
                          '✦ Analyze with AI'
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-5">
                      <div>
                        <h4 style={{
                          fontSize: '11px', fontWeight: 600,
                          color: 'var(--text-muted)',
                          textTransform: 'uppercase', letterSpacing: '0.05em',
                          marginBottom: '8px',
                        }}>
                          Summary
                        </h4>
                        <p style={{
                          fontSize: '14px', color: 'white',
                          lineHeight: 1.7,
                          padding: '14px',
                          background: 'rgba(255,255,255,0.02)',
                          borderRadius: '10px',
                        }}>
                          {selectedDoc.aiSummary}
                        </p>
                      </div>

                      {selectedDoc.extractedData && Object.keys(selectedDoc.extractedData).length > 0 && (
                        <div>
                          <h4 style={{
                            fontSize: '11px', fontWeight: 600,
                            color: 'var(--text-muted)',
                            textTransform: 'uppercase', letterSpacing: '0.05em',
                            marginBottom: '8px',
                          }}>
                            Key Values
                          </h4>
                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                            gap: '10px',
                          }}>
                            {Object.entries(selectedDoc.extractedData).map(([key, value]) => (
                              <div key={key} style={{
                                padding: '12px 14px',
                                borderRadius: '10px',
                                background: 'rgba(255,255,255,0.02)',
                                border: '1px solid rgba(255,255,255,0.05)',
                              }}>
                                <div style={{
                                  fontSize: '11px', color: 'var(--text-muted)',
                                  marginBottom: '4px', fontWeight: 500,
                                }}>
                                  {key}
                                </div>
                                <div style={{
                                  fontSize: '15px', color: 'white', fontWeight: 700,
                                }}>
                                  {String(value)}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {selectedDoc.abnormalFlags && selectedDoc.abnormalFlags.length > 0 && (
                        <div>
                          <h4 style={{
                            fontSize: '11px', fontWeight: 600,
                            color: 'var(--danger)',
                            textTransform: 'uppercase', letterSpacing: '0.05em',
                            marginBottom: '8px',
                          }}>
                            ⚠ Abnormal Findings
                          </h4>
                          <div style={{
                            padding: '14px',
                            background: 'rgba(255,77,106,0.06)',
                            borderRadius: '10px',
                            border: '1px solid rgba(255,77,106,0.2)',
                          }}>
                            {selectedDoc.abnormalFlags.map((flag: string, i: number) => (
                              <div key={i} className="flex items-start gap-2"
                                style={{ marginBottom: i < selectedDoc.abnormalFlags.length - 1 ? '8px' : 0 }}>
                                <div style={{
                                  width: '6px', height: '6px', borderRadius: '50%',
                                  background: 'var(--danger)', marginTop: '6px', flexShrink: 0,
                                }} />
                                <span style={{ fontSize: '13px', color: 'white' }}>{flag}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {selectedDoc.actionItems && selectedDoc.actionItems.length > 0 && (
                        <div>
                          <h4 style={{
                            fontSize: '11px', fontWeight: 600,
                            color: 'var(--teal)',
                            textTransform: 'uppercase', letterSpacing: '0.05em',
                            marginBottom: '8px',
                          }}>
                            Recommended Actions
                          </h4>
                          <div className="flex flex-col gap-2">
                            {selectedDoc.actionItems.map((item: string, i: number) => (
                              <div key={i} className="flex items-start gap-3" style={{
                                padding: '12px 14px',
                                background: 'rgba(0,201,177,0.06)',
                                borderRadius: '10px',
                                border: '1px solid rgba(0,201,177,0.15)',
                              }}>
                                <div style={{
                                  width: '20px', height: '20px', borderRadius: '50%',
                                  background: 'rgba(0,201,177,0.15)',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  flexShrink: 0, fontSize: '11px', fontWeight: 700,
                                  color: 'var(--teal)',
                                }}>
                                  {i + 1}
                                </div>
                                <span style={{ fontSize: '13px', color: 'white', lineHeight: 1.6 }}>
                                  {item}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div style={{
                        fontSize: '11px', color: 'var(--text-disabled)',
                        padding: '10px 14px',
                        background: 'rgba(255,255,255,0.03)',
                        borderRadius: '8px', lineHeight: 1.6,
                      }}>
                        ⚠️ AI analysis is for informational purposes only.
                        Always consult a qualified healthcare professional.
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'symptoms' && (
        <div>
          <h2 className="text-xl font-bold text-white mb-6">Symptom History</h2>
          <div className="bg-[#1A2942] rounded-xl border border-[#64748B]/20 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#0F1A2E] border-b border-[#64748B]/30">
                    <th className="p-4 text-sm font-medium text-[#64748B]">Date</th>
                    <th className="p-4 text-sm font-medium text-[#64748B]">Initial Symptoms</th>
                    <th className="p-4 text-sm font-medium text-[#64748B]">Urgency</th>
                    <th className="p-4 text-sm font-medium text-[#64748B]">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#64748B]/20">
                  {isLoadingSymptoms ? (
                    <tr><td colSpan={4} className="p-8 text-center"><LoadingSpinner className="mx-auto" /></td></tr>
                  ) : symptoms?.length === 0 ? (
                    <tr><td colSpan={4} className="p-8 text-center text-[#64748B]">No symptom checks found.</td></tr>
                  ) : (
                    symptoms?.map(session => (
                      <tr key={session._id} className="hover:bg-[#64748B]/5 transition-colors">
                        <td className="p-4 text-sm text-white whitespace-nowrap">
                          {format(new Date(session.createdAt), 'MMM d, yyyy')}
                        </td>
                        <td className="p-4 text-sm text-[#64748B] max-w-xs truncate">
                          {session.initialSymptoms.join(', ')}
                        </td>
                        <td className="p-4">
                          {session.urgencyScore ? (
                            <Badge variant={session.urgencyScore >= 7 ? 'danger' : session.urgencyScore >= 4 ? 'warning' : 'success'}>
                              {session.urgencyScore}/10
                            </Badge>
                          ) : <span className="text-[#64748B]">-</span>}
                        </td>
                        <td className="p-4">
                          <Badge variant={session.status === 'completed' ? 'success' : 'warning'}>
                            {session.status}
                          </Badge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'drugs' && (
        <div>
          <h2 className="text-xl font-bold text-white mb-6">Drug Checks History</h2>
          <div className="grid grid-cols-1 gap-4">
            {isLoadingDrugs ? (
              <div className="text-center py-10"><LoadingSpinner className="mx-auto" /></div>
            ) : drugs?.length === 0 ? (
              <div className="bg-[#1A2942] rounded-xl p-10 text-center border border-[#64748B]/20">
                <Pill className="w-12 h-12 text-[#64748B] mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No drug checks</h3>
                <p className="text-[#64748B]">Check for interactions between your medications.</p>
              </div>
            ) : (
              drugs?.map(check => (
                <div key={check._id} className="bg-[#1A2942] rounded-xl p-5 border border-[#64748B]/20 flex items-center justify-between">
                  <div>
                    <div className="text-sm text-[#64748B] mb-2">{format(new Date(check.createdAt), 'MMM d, yyyy')}</div>
                    <div className="flex flex-wrap gap-2">
                      {check.medications.map((med: string, i: number) => (
                        <span key={i} className="px-2 py-1 bg-[#0F1A2E] text-white rounded-md text-sm border border-[#64748B]/30">
                          {med}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Badge variant={
                      check.overallRiskLevel === 'Low' ? 'success' :
                      check.overallRiskLevel === 'Moderate' ? 'warning' :
                      check.overallRiskLevel === 'High' ? 'danger' : 'danger'
                    } className="text-sm px-3 py-1">
                      {check.overallRiskLevel} Risk
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'appointments' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">My Appointments</h2>
            <Link
              href="/doctors"
              className="px-4 py-2 bg-[#0F1A2E] border border-[#64748B]/30 text-[#0EA5A0] text-sm rounded-md hover:bg-[#1A2942] transition-colors"
            >
              Book New
            </Link>
          </div>

          {isLoadingAppointments ? (
            <div className="text-center py-20 text-[#64748B]">
              <LoadingSpinner className="w-8 h-8 mx-auto mb-4 opacity-50" />
              <p>Loading appointments...</p>
            </div>
          ) : appointments && appointments.length > 0 ? (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block bg-[#1A2942] rounded-xl border border-[#64748B]/20 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#0F1A2E] border-b border-[#64748B]/30">
                        <th className="p-4 text-sm font-medium text-[#64748B]">Doctor</th>
                        <th className="p-4 text-sm font-medium text-[#64748B]">Date & Time</th>
                        <th className="p-4 text-sm font-medium text-[#64748B]">Consultation</th>
                        <th className="p-4 text-sm font-medium text-[#64748B]">Status</th>
                        <th className="p-4 text-sm font-medium text-[#64748B] text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#64748B]/20">
                      {appointments.map((appointment) => (
                        <tr key={appointment._id} className="hover:bg-[#64748B]/5 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              {appointment.doctorId?.imageUrl ? (
                                <img src={appointment.doctorId.imageUrl} alt={appointment.doctorId.name} className="w-10 h-10 rounded-full object-cover" />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-[#0F1A2E] flex items-center justify-center text-[#64748B]">
                                  <Activity size={18} />
                                </div>
                              )}
                              <div>
                                <div className="text-white font-medium text-sm">{appointment.doctorId?.name}</div>
                                <div className="text-[#0EA5A0] text-xs">{appointment.doctorId?.specialty}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="text-sm">
                              <div className={`text-white ${appointment.status === 'cancelled' ? 'line-through text-[#64748B]' : ''}`}>
                                {format(new Date(appointment.appointmentDate), 'MMM d, yyyy')}
                              </div>
                              <div className="text-[#64748B] text-xs mt-1">{appointment.timeSlot}</div>
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge variant="outline">{appointment.consultationType}</Badge>
                          </td>
                          <td className="p-4">
                            {appointment.status === 'pending' && <Badge variant="warning">Pending</Badge>}
                            {appointment.status === 'confirmed' && <Badge variant="success">Confirmed</Badge>}
                            {appointment.status === 'cancelled' && <Badge variant="outline" className="text-[#64748B] border-[#64748B]">Cancelled</Badge>}
                          </td>
                          <td className="p-4 text-right">
                            {appointment.status === 'pending' && (
                              <button
                                onClick={() => cancelAppointmentMutation.mutate(appointment._id)}
                                disabled={cancelAppointmentMutation.isPending}
                                className="text-red-400 hover:text-red-300 transition-colors text-sm font-medium"
                              >
                                Cancel
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-4">
                {appointments.map((appointment) => (
                  <div key={appointment._id} className="bg-[#1A2942] rounded-xl p-5 border border-[#64748B]/20 flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                      {appointment.doctorId?.imageUrl ? (
                        <img src={appointment.doctorId.imageUrl} alt={appointment.doctorId.name} className="w-12 h-12 rounded-full object-cover" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-[#0F1A2E] flex items-center justify-center text-[#64748B]">
                          <Activity size={20} />
                        </div>
                      )}
                      <div>
                        <h3 className="text-white font-medium">{appointment.doctorId?.name}</h3>
                        <p className="text-[#0EA5A0] text-sm">{appointment.doctorId?.specialty}</p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 text-sm border-t border-[#64748B]/20 pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-[#64748B]">Date & Time</span>
                        <div className="text-right">
                          <div className={`text-white ${appointment.status === 'cancelled' ? 'line-through text-[#64748B]' : ''}`}>
                            {format(new Date(appointment.appointmentDate), 'MMM d, yyyy')}
                          </div>
                          <div className="text-[#64748B] text-xs">{appointment.timeSlot}</div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-[#64748B]">Consultation</span>
                        <Badge variant="outline">{appointment.consultationType}</Badge>
                      </div>

                      <div className="flex justify-between items-center mt-2">
                        <span className="text-[#64748B]">Status</span>
                        <div>
                          {appointment.status === 'pending' && <Badge variant="warning">Pending</Badge>}
                          {appointment.status === 'confirmed' && <Badge variant="success">Confirmed</Badge>}
                          {appointment.status === 'cancelled' && <Badge variant="outline" className="text-[#64748B] border-[#64748B]">Cancelled</Badge>}
                        </div>
                      </div>

                      {appointment.status === 'pending' && (
                        <button
                          onClick={() => cancelAppointmentMutation.mutate(appointment._id)}
                          disabled={cancelAppointmentMutation.isPending}
                          className="w-full text-center py-2 mt-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-md transition-colors text-sm font-medium"
                        >
                          Cancel Appointment
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-20 bg-[#1A2942] rounded-xl border border-[#64748B]/20">
              <div className="w-16 h-16 bg-[#0F1A2E] rounded-full flex items-center justify-center mx-auto mb-4 text-[#64748B]">
                <Calendar size={32} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No appointments yet</h3>
              <p className="text-[#64748B] mb-6">Book a doctor from the Doctors directory</p>
              <Link
                href="/doctors"
                className="px-6 py-2 bg-[#0EA5A0] text-white font-medium rounded-md hover:bg-[#0EA5A0]/90 transition-colors"
              >
                Find a Doctor
              </Link>
            </div>
          )}
        </div>
      )}
      {activeTab === 'saved' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">Saved Doctors</h2>
          </div>

          <div className="flex flex-wrap gap-6">
            {isLoadingBookmarks ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} style={{ height: '340px', width: '280px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', animation: 'pulse 1.5s ease-in-out infinite' }} />
              ))
            ) : bookmarks && bookmarks.length > 0 ? (
              bookmarks.map((bookmark: any) => (
                <DoctorCard 
                  key={bookmark._id} 
                  doctor={bookmark.doctorId} 
                  isBookmarked={true}
                  onBookmarkToggle={(e) => {
                    e.preventDefault();
                    toggleBookmarkMutation.mutate(bookmark.doctorId._id);
                  }}
                />
              ))
            ) : (
              <div className="w-full text-center py-20 bg-[#1A2942] rounded-xl border border-[#64748B]/20">
                <div className="w-16 h-16 bg-[#0F1A2E] rounded-full flex items-center justify-center mx-auto mb-4 text-[#64748B]">
                  <Bookmark size={32} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">No saved doctors yet</h3>
                <p className="text-[#64748B] mb-6">Find and save doctors for quick access later</p>
                <Link
                  href="/doctors"
                  className="px-6 py-2 bg-[#0EA5A0] text-white font-medium rounded-md hover:bg-[#0EA5A0]/90 transition-colors inline-block"
                >
                  Browse Doctors
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {showUploadModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)' }}
          onClick={() => setShowUploadModal(false)}
        >
          <div
            className="bg-[#1A2942] rounded-xl border border-[#64748B]/20 w-full flex flex-col gap-5"
            style={{ maxWidth: '480px', padding: '32px' }}
            onClick={e => e.stopPropagation()}
          >
            <h2 style={{
              fontWeight: 700,
              fontSize: '20px',
              color: 'white'
            }}>
              Upload Medical Document
            </h2>

            {/* File input */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 500,
                color: 'var(--text-muted)',
                marginBottom: '6px'
              }}>
                File (PDF, JPG, PNG)
              </label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.webp"
                onChange={e => setUploadFile(e.target.files?.[0] ?? null)}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-opacity)',
                  background: 'rgba(255,255,255,0.02)',
                  color: 'var(--text-muted)',
                  fontSize: '13px',
                }}
              />
            </div>

            {/* Document type */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 500,
                color: 'var(--text-muted)',
                marginBottom: '6px'
              }}>
                Document Type
              </label>
              <select
                value={uploadType}
                onChange={e => setUploadType(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-opacity)',
                  background: 'rgba(255,255,255,0.02)',
                  color: 'white',
                  fontSize: '13px',
                  colorScheme: 'dark'
                }}
              >
                <option style={{ background: '#1A2942', color: 'white' }}>Lab Report</option>
                <option style={{ background: '#1A2942', color: 'white' }}>Prescription</option>
                <option style={{ background: '#1A2942', color: 'white' }}>MRI / Scan</option>
                <option style={{ background: '#1A2942', color: 'white' }}>Discharge Summary</option>
                <option style={{ background: '#1A2942', color: 'white' }}>X-Ray</option>
                <option style={{ background: '#1A2942', color: 'white' }}>Other</option>
              </select>
            </div>

            {/* Document date */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 500,
                color: 'var(--text-muted)',
                marginBottom: '6px'
              }}>
                Document Date (optional)
              </label>
              <input
                type="date"
                value={uploadDate}
                onChange={e => setUploadDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-opacity)',
                  background: 'rgba(255,255,255,0.02)',
                  color: 'white',
                  fontSize: '13px',
                  colorScheme: 'dark'
                }}
              />
            </div>

            {/* Error */}
            {uploadError && (
              <div style={{
                fontSize: '13px',
                color: 'var(--danger)',
                padding: '10px 14px',
                background: 'rgba(255,77,106,0.08)',
                borderRadius: '8px',
              }}>
                {uploadError}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  if (!uploadFile) {
                    setUploadError('Please select a file.');
                    return;
                  }
                  setUploadError('');
                  uploadMutation.mutate({
                    file: uploadFile,
                    type: uploadType,
                    documentDate: uploadDate || undefined,
                  });
                }}
                disabled={uploadMutation.isPending || !uploadFile}
                className="px-4 py-2 bg-[#0EA5A0] text-white rounded-md hover:bg-[#0EA5A0]/90 transition-colors flex-grow flex items-center justify-center disabled:opacity-50 font-medium"
                style={{ height: '44px' }}
              >
                {uploadMutation.isPending ? (
                  <LoadingSpinner className="w-4 h-4" />
                ) : (
                  'Upload'
                )}
              </button>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setUploadFile(null);
                  setUploadError('');
                }}
                className="px-4 py-2 border border-[#64748B]/30 text-white rounded-md hover:bg-[#64748B]/10 transition-colors flex-grow flex items-center justify-center font-medium"
                style={{ height: '44px' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
