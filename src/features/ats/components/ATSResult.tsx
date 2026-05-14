'use client';

import { useState } from 'react';
import type { CVFormData } from '@/types';

interface ATSResult {
  score: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
}

interface ATSResultProps {
  result: ATSResult | null;
  onClose: () => void;
}

function ScoreBar({ score }: { score: number }) {
  const color =
    score >= 80 ? 'bg-green-500' :
    score >= 60 ? 'bg-yellow-500' :
    'bg-red-500';

  return (
    <div className="w-full bg-[#27272A] rounded-full h-3 mb-2">
      <div
        className={`h-3 rounded-full ${color} transition-all duration-500`}
        style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
      />
    </div>
  );
}

export default function ATSResult({ result, onClose }: ATSResultProps) {
  if (!result) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-[#111111] border border-[#27272A] rounded-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">ATS Score Result</h2>
          <button
            onClick={onClose}
            className="text-[#A1A1AA] hover:text-white text-2xl cursor-pointer"
            type="button"
          >
            &times;
          </button>
        </div>

        {/* Score */}
        <div className="text-center mb-6">
          <div className="text-5xl font-bold text-white mb-1">{result.score}<span className="text-2xl text-[#A1A1AA]">/100</span></div>
          <ScoreBar score={result.score} />
          <p className="text-sm text-[#A1A1AA] mt-1">
            {result.score >= 80 ? 'Excellent! Ready for ATS' :
             result.score >= 60 ? 'Good, but can improve' :
             'Needs significant improvement'}
          </p>
        </div>

        {/* Strengths */}
        {result.strengths?.length > 0 && (
          <div className="mb-4">
            <h3 className="text-green-400 font-semibold mb-2">✅ Strengths</h3>
            <ul className="space-y-1">
              {result.strengths.map((s, i) => (
                <li key={i} className="text-sm text-[#E2E8F0] flex gap-2">
                  <span className="text-green-400 mt-0.5">✓</span>
                  {s}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Weaknesses */}
        {result.weaknesses?.length > 0 && (
          <div className="mb-4">
            <h3 className="text-yellow-400 font-semibold mb-2">⚠️ Needs Improvement</h3>
            <ul className="space-y-1">
              {result.weaknesses.map((w, i) => (
                <li key={i} className="text-sm text-[#E2E8F0] flex gap-2">
                  <span className="text-yellow-400 mt-0.5">⚠</span>
                  {w}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Suggestions */}
        {result.suggestions?.length > 0 && (
          <div className="mb-4">
            <h3 className="text-[#7C3AED] font-semibold mb-2">💡 Suggestions</h3>
            <ul className="space-y-1">
              {result.suggestions.map((s, i) => (
                <li key={i} className="text-sm text-[#E2E8F0] flex gap-2">
                  <span className="text-[#7C3AED] mt-0.5">•</span>
                  {s}
                </li>
              ))}
            </ul>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full bg-[#7C3AED] hover:bg-[#6D28D] text-white py-2 px-4 rounded-lg font-medium cursor-pointer transition-colors"
          type="button"
        >
          Close
        </button>
      </div>
    </div>
  );
}
