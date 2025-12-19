'use client';

import React, { ReactNode } from 'react';
import { usePipeline } from '../hooks/useDeals';
import type { Deal, PipelineStage } from '../types';

export interface PipelineHeadlessProps {
  renderStage: (props: StageRenderProps) => ReactNode;
  renderDeal: (props: DealRenderProps) => ReactNode;
  renderLoading?: () => ReactNode;
  renderError?: (error: Error) => ReactNode;
  renderEmpty?: () => ReactNode;
  onDealClick?: (deal: Deal) => void;
  onDealMove?: (dealId: string, stageId: string) => void;
}

export interface StageRenderProps {
  stage: PipelineStage;
  deals: Deal[];
  totalValue: number;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  renderDeals: () => ReactNode;
}

export interface DealRenderProps {
  deal: Deal;
  onDragStart: (e: React.DragEvent) => void;
  onClick: () => void;
}

export function PipelineHeadless({
  renderStage,
  renderDeal,
  renderLoading,
  renderError,
  renderEmpty,
  onDealClick,
  onDealMove,
}: PipelineHeadlessProps) {
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

  if (isLoading && renderLoading) {
    return <>{renderLoading()}</>;
  }

  if (error && renderError) {
    return <>{renderError(error)}</>;
  }

  if (stages.length === 0 && renderEmpty) {
    return <>{renderEmpty()}</>;
  }

  return (
    <>
      {stages.map((stage) => {
        const totalValue = stage.deals.reduce((sum, deal) => sum + deal.value, 0);

        const renderDeals = () => (
          <>
            {stage.deals.map((deal) =>
              renderDeal({
                deal,
                onDragStart: (e) => handleDragStart(e, deal.id),
                onClick: () => onDealClick?.(deal),
              })
            )}
          </>
        );

        return (
          <React.Fragment key={stage.id}>
            {renderStage({
              stage,
              deals: stage.deals,
              totalValue,
              onDragOver: handleDragOver,
              onDrop: (e) => handleDrop(e, stage.id),
              renderDeals,
            })}
          </React.Fragment>
        );
      })}
    </>
  );
}
