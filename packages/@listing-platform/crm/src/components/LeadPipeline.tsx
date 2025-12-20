'use client';

import React from 'react';
import { cn } from '../utils/cn';
import { usePipeline } from '../hooks/useDeals';
import { DealCard } from './DealCard';
import type { Deal, DealFilters } from '../types';

export interface LeadPipelineProps {
  filters?: DealFilters;
  onDealClick?: (deal: Deal) => void;
  onDealMove?: (dealId: string, stageId: string) => void;
  className?: string;
}

export function LeadPipeline({
  onDealClick,
  onDealMove,
  className,
}: LeadPipelineProps) {
  const { stages, isLoading, error, moveDeal } = usePipeline();

  const handleDragStart = (e: React.DragEvent, dealId: string) => {
    e.dataTransfer.setData('dealId', dealId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    const dealId = e.dataTransfer.getData('dealId');
    
    if (dealId) {
      await moveDeal(dealId, stageId);
      onDealMove?.(dealId, stageId);
    }
  };

  if (isLoading) {
    return (
      <div className={cn('lead-pipeline flex gap-4 overflow-x-auto p-4', className)}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex-shrink-0 w-72">
            <div className="h-8 w-24 animate-pulse rounded bg-gray-200 mb-3" />
            <div className="space-y-3">
              {[1, 2].map((j) => (
                <div key={j} className="h-32 animate-pulse rounded-lg bg-gray-100" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn('lead-pipeline rounded-lg border border-red-200 bg-red-50 p-4', className)}>
        <p className="text-red-600">Failed to load pipeline: {error.message}</p>
      </div>
    );
  }

  return (
    <div className={cn('lead-pipeline flex gap-4 overflow-x-auto pb-4', className)}>
      {stages.map((stage) => {
        const stageTotal = stage.deals.reduce((sum, deal) => sum + deal.value, 0);
        
        return (
          <div
            key={stage.id}
            className="flex-shrink-0 w-72"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, stage.id)}
          >
            {/* Stage header */}
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {stage.color && (
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: stage.color }}
                  />
                )}
                <h3 className="font-medium text-gray-900">{stage.name}</h3>
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                  {stage.deals.length}
                </span>
              </div>
              <span className="text-sm text-gray-500">
                ${stageTotal.toLocaleString()}
              </span>
            </div>

            {/* Deals column */}
            <div className="space-y-3 min-h-[200px] rounded-lg bg-gray-50 p-2">
              {stage.deals.length === 0 ? (
                <div className="flex h-32 items-center justify-center text-sm text-gray-400">
                  No deals
                </div>
              ) : (
                stage.deals.map((deal) => (
                  <div
                    key={deal.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, deal.id)}
                    className="cursor-move"
                  >
                    <DealCard
                      deal={deal}
                      variant="compact"
                      onClick={() => onDealClick?.(deal)}
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
