"use client";

import { sendGAEvent } from '@next/third-parties/google';

/**
 * ARCHIVAL ANALYTICS - CUSTOM EVENT MAPPER
 * High-precision tracking for museum-grade interactions.
 */

export const trackArtifactView = (productName: string, category: string) => {
  sendGAEvent('event', 'view_artifact', { 
    artifact_name: productName,
    artifact_category: category,
    timestamp: new Date().toISOString()
  });
};

export const trackViewerOpen = (productName: string) => {
  sendGAEvent('event', 'open_3d_viewer', {
    artifact_name: productName,
    interaction_type: 'digital_twin_inspection'
  });
};

export const trackAddToVault = (productName: string) => {
  sendGAEvent('event', 'add_to_vault', {
    artifact_name: productName,
    value: 1
  });
};

export const trackCheckoutInitiated = (productName: string, price: number) => {
  sendGAEvent('event', 'begin_checkout', {
    artifact_name: productName,
    value: price,
    currency: 'INR'
  });
};
