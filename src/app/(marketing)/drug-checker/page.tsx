'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import { Plus, X, AlertTriangle, Shield } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Badge } from '@/components/ui/badge';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { useToast } from '@/components/ui/toast';

interface DrugPairInteraction {
  drug1: string;
  drug2: string;
  severity: 'low' | 'moderate' | 'high' | 'severe';
  description: string;
}

interface ResolvedMedication {
  original: string;
  generic: string;
  wasResolved: boolean;
}

interface InteractionResult {
  interactionMatrix: DrugPairInteraction[];
  dangerFlags: string[];
  overallRiskLevel: 'low' | 'moderate' | 'high' | 'severe';
  resolvedMedications: ResolvedMedication[];
}

const RISK_COLORS = {
  low: '#22c55e',
  moderate: '#eab308',
  high: '#f97316',
  severe: '#ef4444',
};

const RISK_BADGE_VARIANTS: Record<string, 'success' | 'warning' | 'danger'> = {
  low: 'success',
  moderate: 'warning',
  high: 'danger',
  severe: 'danger',
};

import AuthGuard from "@/components/auth-guard";

export default function DrugCheckerPage() {
  return (
    <AuthGuard>
      <DrugCheckerContent />
    </AuthGuard>
  );
}

function DrugCheckerContent() {
  const { data: session } = useSession();
  const toast = useToast();

  const [medInput, setMedInput] = useState('');
  const [medications, setMedications] = useState<string[]>([]);
  const [result, setResult] = useState<InteractionResult | null>(null);
  const [validationError, setValidationError] = useState<{
    message: string;
    invalidMedications: string[];
  } | null>(null);

  const checkMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/ai/check-drugs', { medications });
      return res.data.data as InteractionResult;
    },
    onSuccess: (data) => {
      setResult(data);
      setValidationError(null);
    },
    onError: (error: any) => {
      const responseData = error?.response?.data;
      if (responseData?.code === 'INVALID_MEDICATIONS') {
        setValidationError({
          message: responseData.message,
          invalidMedications: responseData.invalidMedications ?? [],
        });
      } else {
        toast.error(responseData?.message || 'Drug check failed. Please try again.');
        console.error('Drug check failed:', error);
      }
    }
  });

  const handleCheck = async () => {
    setValidationError(null);
    
    // Basic client-side check — min 3 chars, no pure numbers
    const invalid = medications.filter(m => 
      m.length < 3 || /^\d+$/.test(m)
    );
    
    if (invalid.length > 0) {
      setValidationError({
        message: `These don't look like medication names: ${invalid.join(', ')}`,
        invalidMedications: invalid
      });
      return;
    }
    
    checkMutation.mutate();
  };

  const addMedication = () => {
    const trimmed = medInput.trim();
    if (trimmed && !medications.includes(trimmed)) {
      setMedications(prev => [...prev, trimmed]);
      setValidationError(null);
    }
    setMedInput('');
  };

  const removeMedication = (med: string) => {
    setMedications(prev => prev.filter(m => m !== med));
    setValidationError(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addMedication();
    }
  };

  if (!session) return null;

  // Build chart data from interaction matrix
  const chartData = result?.interactionMatrix?.map(interaction => ({
    pair: `${interaction.drug1} + ${interaction.drug2}`,
    severity: ['low', 'moderate', 'high', 'severe'].indexOf(interaction.severity) + 1,
    level: interaction.severity,
  })) ?? [];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Drug Interaction Checker</h1>
        <p className="text-[#64748B]">
          Add all your current medications and let our AI analyze potential interactions.
        </p>
      </div>

      {/* Input section */}
      <div className="bg-[#1A2942] rounded-xl border border-[#64748B]/20 p-6 mb-8">
        <h2 className="text-lg font-bold text-white mb-4">Add Medications</h2>

        <div className="flex gap-3 mb-4">
          <input
            type="text"
            value={medInput}
            onChange={(e) => setMedInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a medication name and press Enter..."
            className="flex-grow bg-[#0F1A2E] border border-[#64748B]/30 rounded-md px-4 py-2 text-white focus:outline-none focus:border-[#0EA5A0] transition-colors"
          />
          <button
            onClick={addMedication}
            disabled={!medInput.trim()}
            className="px-4 py-2 bg-[#64748B]/20 border border-[#64748B]/30 text-white rounded-md hover:bg-[#0EA5A0]/20 hover:border-[#0EA5A0] transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Plus className="w-5 h-5" /> Add
          </button>
        </div>

        {medications.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {medications.map(med => {
              const isInvalid = validationError?.invalidMedications.includes(med);
              return (
                <div
                  key={med}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm"
                  style={{
                    background: isInvalid ? 'rgba(239,68,68,0.12)' : '#0F1A2E',
                    border: isInvalid
                      ? '1px solid rgba(239,68,68,0.4)'
                      : '1px solid rgba(100,116,139,0.3)',
                    color: isInvalid ? '#f87171' : 'white',
                  }}
                >
                  <span>{med}</span>
                  <button
                    onClick={() => removeMedication(med)}
                    className="transition-colors"
                    style={{ color: isInvalid ? '#f87171' : '#64748B' }}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        <button
          onClick={handleCheck}
          disabled={medications.length < 2 || checkMutation.isPending}
          className="w-full py-3 bg-[#0EA5A0] text-white font-semibold rounded-md hover:bg-[#0EA5A0]/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
        >
          {checkMutation.isPending ? (
            <><LoadingSpinner className="w-5 h-5 text-white" /> Analyzing interactions...</>
          ) : (
            <><Shield className="w-5 h-5" /> Check Interactions</>
          )}
        </button>
        {medications.length < 2 && (
          <p className="text-center text-[#64748B] text-sm mt-2">Add at least 2 medications to check interactions.</p>
        )}
        {validationError && (
          <div
            className="rounded-lg p-4 mb-4 mt-2"
            style={{
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.25)',
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span className="text-red-400 font-medium text-sm">
                Unrecognized medication names
              </span>
            </div>
            <div className="flex flex-wrap gap-2 mb-2">
              {validationError.invalidMedications.map(med => (
                <span
                  key={med}
                  className="px-2 py-1 rounded-full text-xs font-medium"
                  style={{
                    background: 'rgba(239,68,68,0.15)',
                    color: '#f87171',
                    border: '1px solid rgba(239,68,68,0.3)'
                  }}
                >
                  {med}
                </span>
              ))}
            </div>
            <p className="text-sm" style={{ color: '#94a3b8' }}>
              Please remove the highlighted medications and try again with real drug names
              (e.g. Aspirin, Metformin, Lisinopril).
            </p>
          </div>
        )}
        {checkMutation.isError && (
          <p className="text-center text-red-400 text-sm mt-2">
            {(checkMutation.error as any)?.response?.data?.message ?? 'Analysis failed. Please try again.'}
          </p>
        )}
      </div>

      {/* Results section */}
      {result && (
        <div className="space-y-6">
          {result.resolvedMedications?.some(r => r.wasResolved) && (
            <div
              className="rounded-lg p-4 mb-4"
              style={{
                background: 'rgba(14,165,160,0.08)',
                border: '1px solid rgba(14,165,160,0.25)',
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-4 h-4" style={{ color: 'var(--teal, #0EA5A0)' }} />
                <span className="text-sm font-medium" style={{ color: '#0EA5A0' }}>
                  Trade names resolved to generic names for accurate analysis
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.resolvedMedications
                  .filter(r => r.wasResolved)
                  .map(r => (
                    <div
                      key={r.original}
                      className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full"
                      style={{
                        background: 'rgba(14,165,160,0.12)',
                        border: '1px solid rgba(14,165,160,0.25)',
                        color: '#94a3b8'
                      }}
                    >
                      <span style={{ color: 'white', fontWeight: 500 }}>{r.original}</span>
                      <span>→</span>
                      <span style={{ color: '#0EA5A0', fontWeight: 600 }}>{r.generic}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Overall risk */}
          <div className="bg-[#1A2942] rounded-xl border border-[#64748B]/20 p-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white mb-1">Overall Risk Level</h2>
              <p className="text-[#64748B] text-sm">Based on {medications.length} medications analyzed</p>
            </div>
            <div className="flex items-center gap-3">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: RISK_COLORS[result.overallRiskLevel] ?? '#64748B' }}
              />
              <span className="text-2xl font-bold" style={{ color: RISK_COLORS[result.overallRiskLevel] ?? '#64748B' }}>
                {result.overallRiskLevel}
              </span>
            </div>
          </div>

          {/* Danger flags */}
          {result.dangerFlags && result.dangerFlags.length > 0 && (
            <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-6">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                Danger Flags
              </h2>
              <div className="space-y-2">
                {result.dangerFlags.map((flag, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />
                    <span className="text-white">{flag}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Interaction Matrix */}
          {result.interactionMatrix && result.interactionMatrix.length > 0 && (
            <div className="bg-[#1A2942] rounded-xl border border-[#64748B]/20 p-6">
              <h2 className="text-lg font-bold text-white mb-4">Interaction Matrix</h2>
              <div className="space-y-3 mb-6">
                {result.interactionMatrix?.map((interaction, i) => (
                  <div key={i} className="bg-[#0F1A2E] rounded-lg p-4 border border-[#64748B]/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-white text-sm">
                        {interaction.drug1} + {interaction.drug2}
                      </span>
                      <Badge variant={RISK_BADGE_VARIANTS[interaction.severity] ?? 'default'}>
                        {interaction.severity}
                      </Badge>
                    </div>
                    <p className="text-[#64748B] text-sm">{interaction.description}</p>
                  </div>
                ))}
              </div>

              {/* Chart */}
              {chartData.length > 0 && (
                <div className="h-64 w-full mt-4">
                  <h3 className="text-sm font-medium text-[#64748B] mb-4">Severity Visualization (1=Low, 4=Severe)</h3>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#64748B" opacity={0.2} />
                      <XAxis type="number" domain={[0, 4]} ticks={[1, 2, 3, 4]} stroke="#64748B" fontSize={12} />
                      <YAxis type="category" dataKey="pair" stroke="#64748B" fontSize={10} width={130} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0F1A2E', borderColor: '#64748B', color: '#fff' }}
                        formatter={(value) => {
                          const labels = ['', 'Low', 'Moderate', 'High', 'Severe'];
                          const idx = typeof value === 'number' ? value : 0;
                          return [labels[idx] || String(value), 'Severity'];
                        }}
                      />
                      <Bar dataKey="severity" radius={[0, 4, 4, 0]}>
                        {chartData.map((entry, index) => (
                          <Cell key={index} fill={RISK_COLORS[entry.level as keyof typeof RISK_COLORS] || '#64748B'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
