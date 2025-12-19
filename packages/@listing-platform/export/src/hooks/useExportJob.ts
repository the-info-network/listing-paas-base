'use client';

import { useState, useEffect, useCallback } from 'react';
import type { ExportJob } from '../types';

interface UseExportJobResult {
  job: ExportJob | null;
  isLoading: boolean;
  download: () => void;
}

export function useExportJob(jobId: string | null): UseExportJobResult {
  const [job, setJob] = useState<ExportJob | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!jobId) return;
    
    const poll = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/export/jobs/${jobId}`);
        if (response.ok) {
          const data = await response.json();
          setJob(data.job);
          if (data.job.status === 'pending' || data.job.status === 'processing') {
            setTimeout(poll, 2000);
          }
        }
      } finally {
        setIsLoading(false);
      }
    };
    poll();
  }, [jobId]);

  const download = useCallback(() => {
    if (job?.downloadUrl) {
      window.open(job.downloadUrl, '_blank');
    }
  }, [job]);

  return { job, isLoading, download };
}
