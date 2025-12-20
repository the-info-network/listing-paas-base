'use client';

import React, { useState } from 'react';
import { cn } from '../utils/cn';
import { useVerification } from '../hooks/useVerification';
import type { VerificationType, VerificationResult } from '../types';

export interface VerificationFlowProps {
  type: VerificationType;
  onComplete?: (result: VerificationResult) => void;
  className?: string;
}

export function VerificationFlow({ type, onComplete, className }: VerificationFlowProps) {
  const { startVerification, uploadDocument, isSubmitting, error } = useVerification();
  const [step, setStep] = useState<'intro' | 'upload' | 'processing' | 'complete'>('intro');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const typeLabels: Record<VerificationType, { title: string; description: string }> = {
    identity: { title: 'Identity Verification', description: 'Upload a government-issued ID to verify your identity.' },
    business: { title: 'Business Verification', description: 'Submit your business license or registration.' },
    phone: { title: 'Phone Verification', description: "We'll send a code to verify your phone number." },
    email: { title: 'Email Verification', description: "We'll send a verification link to your email." },
    social: { title: 'Social Verification', description: 'Link your social media accounts.' },
    background: { title: 'Background Check', description: 'Consent to a background verification.' },
    license: { title: 'License Verification', description: 'Upload your professional license.' },
  };

  const handleStart = () => setStep('upload');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setSelectedFile(e.target.files[0]);
  };

  const handleSubmit = async () => {
    if (selectedFile) {
      setStep('processing');
      await uploadDocument(type, selectedFile);
      const result = await startVerification(type);
      setStep('complete');
      onComplete?.(result);
    }
  };

  const { title, description } = typeLabels[type];

  return (
    <div className={cn('rounded-lg border border-gray-200 bg-white p-6', className)}>
      {step === 'intro' && (
        <div className="text-center">
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="mt-2 text-gray-600">{description}</p>
          <button onClick={handleStart} className="mt-4 rounded-md bg-blue-600 px-6 py-2 text-white hover:bg-blue-700">Start Verification</button>
        </div>
      )}

      {step === 'upload' && (
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          <div className="mt-4">
            <label className="block cursor-pointer rounded-lg border-2 border-dashed border-gray-300 p-6 text-center hover:border-blue-400">
              <input type="file" accept="image/*,.pdf" onChange={handleFileSelect} className="hidden" />
              {selectedFile ? <p className="text-blue-600">{selectedFile.name}</p> : <p className="text-gray-500">Click or drag to upload document</p>}
            </label>
          </div>
          {error && <p className="mt-2 text-sm text-red-600">{error.message}</p>}
          <button onClick={handleSubmit} disabled={!selectedFile || isSubmitting} className={cn('mt-4 w-full rounded-md bg-blue-600 px-4 py-2 text-white', (!selectedFile || isSubmitting) ? 'opacity-50' : 'hover:bg-blue-700')}>
            {isSubmitting ? 'Submitting...' : 'Submit for Verification'}
          </button>
        </div>
      )}

      {step === 'processing' && (
        <div className="py-8 text-center">
          <div className="text-4xl mb-2">⏳</div>
          <p className="text-gray-600">Processing your verification...</p>
        </div>
      )}

      {step === 'complete' && (
        <div className="py-8 text-center">
          <div className="text-4xl mb-2">✅</div>
          <p className="text-green-600 font-medium">Verification submitted successfully!</p>
          <p className="mt-1 text-sm text-gray-500">We'll notify you once it's reviewed.</p>
        </div>
      )}
    </div>
  );
}
