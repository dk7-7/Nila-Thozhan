import React from 'react';
import { ConfidenceLevel, DocumentStatus, ValidationStatus } from '../../types';
import { CheckCircle2, Clock, AlertCircle, AlertTriangle, FileCheck, XCircle, ShieldCheck } from 'lucide-react';

interface StatusBadgeProps {
  status: DocumentStatus | ValidationStatus | ConfidenceLevel | string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showIcon = true,
}) => {
  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5',
    md: 'text-[10px] px-2.5 py-0.5',
    lg: 'text-xs px-3 py-1 font-semibold',
  }[size];

  switch (status) {
    case 'APPROVED':
    case 'VERIFIED':
      return (
        <span
          id={`status-${status.toLowerCase()}`}
          className={`inline-flex items-center gap-1.5 rounded-full font-bold bg-emerald-50 text-emerald-600 uppercase tracking-tight ${sizeClasses}`}
        >
          {showIcon && <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />}
          <span>{status === 'VERIFIED' ? 'Verified' : 'Approved'}</span>
        </span>
      );

    case 'READY_FOR_APPROVAL':
      return (
        <span
          id={`status-ready`}
          className={`inline-flex items-center gap-1.5 rounded-full font-bold bg-indigo-50 text-indigo-600 uppercase tracking-tight ${sizeClasses}`}
        >
          {showIcon && <ShieldCheck className="w-3 h-3 text-indigo-600 shrink-0" />}
          <span>Ready for Sign</span>
        </span>
      );

    case 'GIS_VERIFIED':
      return (
        <span
          id={`status-gis-verified`}
          className={`inline-flex items-center gap-1.5 rounded-full font-bold bg-blue-50 text-blue-600 uppercase tracking-tight ${sizeClasses}`}
        >
          {showIcon && <FileCheck className="w-3 h-3 text-blue-600 shrink-0" />}
          <span>GIS Verified</span>
        </span>
      );

    case 'UNDER_VERIFICATION':
    case 'NEEDS_MANUAL_REVIEW':
      return (
        <span
          id={`status-under-verification`}
          className={`inline-flex items-center gap-1.5 rounded-full font-bold bg-amber-50 text-amber-600 uppercase tracking-tight ${sizeClasses}`}
        >
          {showIcon && <Clock className="w-3 h-3 text-amber-600 shrink-0" />}
          <span>{status === 'NEEDS_MANUAL_REVIEW' ? 'Verify Manual' : 'Under Verification'}</span>
        </span>
      );

    case 'PROCESSING':
    case 'DIGITIZED':
      return (
        <span
          id={`status-processing`}
          className={`inline-flex items-center gap-1.5 rounded-full font-bold bg-blue-50 text-blue-600 uppercase tracking-tight ${sizeClasses}`}
        >
          {showIcon && <Clock className="w-3 h-3 text-blue-600 shrink-0 animate-spin" />}
          <span>{status === 'DIGITIZED' ? 'Digitized' : 'Processing'}</span>
        </span>
      );

    case 'CONFLICT':
    case 'REJECTED':
      return (
        <span
          id={`status-rejected`}
          className={`inline-flex items-center gap-1.5 rounded-full font-bold bg-rose-50 text-rose-600 uppercase tracking-tight ${sizeClasses}`}
        >
          {showIcon && <XCircle className="w-3 h-3 text-rose-600 shrink-0" />}
          <span>{status === 'CONFLICT' ? 'OCR Conflict' : 'Rejected'}</span>
        </span>
      );

    case 'NEEDS_ATTENTION':
    case 'PARTIALLY_VERIFIED':
      return (
        <span
          id={`status-needs-attention`}
          className={`inline-flex items-center gap-1.5 rounded-full font-bold bg-amber-50 text-amber-600 uppercase tracking-tight ${sizeClasses}`}
        >
          {showIcon && <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />}
          <span>{status === 'PARTIALLY_VERIFIED' ? 'Needs GIS Check' : 'Needs Attention'}</span>
        </span>
      );

    case 'HIGH':
      return (
        <span className="inline-flex items-center gap-1 rounded-full font-bold text-[10px] px-2 py-0.5 bg-emerald-50 text-emerald-600 uppercase tracking-tight">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          High Confidence
        </span>
      );

    case 'MEDIUM':
      return (
        <span className="inline-flex items-center gap-1 rounded-full font-bold text-[10px] px-2 py-0.5 bg-amber-50 text-amber-600 uppercase tracking-tight">
          <AlertCircle className="w-3 h-3 text-amber-600" />
          Medium Confidence
        </span>
      );

    case 'LOW':
      return (
        <span className="inline-flex items-center gap-1 rounded-full font-bold text-[10px] px-2 py-0.5 bg-rose-50 text-rose-600 uppercase tracking-tight">
          <AlertTriangle className="w-3 h-3 text-rose-600" />
          Low Confidence
        </span>
      );

    default:
      return (
        <span className={`inline-flex items-center gap-1 rounded-full font-bold uppercase tracking-tight bg-slate-100 text-slate-700 ${sizeClasses}`}>
          <span>{status}</span>
        </span>
      );
  }
};
