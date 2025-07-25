import { Request } from 'express';
import { IssuePathItem, isValiError } from 'valibot';

type SuspiciousField = {
   path?: string[];
   message: string;
};

type SuspiciousRequestLog = {
   timestamp: string;
   path: string;
   method: string;
   ip: string;
   userAgent?: string;
   suspiciousFields: SuspiciousField[];
   rawBody?: unknown;
};

function logToAuditTrail(entry: SuspiciousRequestLog) {
   console.warn('[SUSPICIOUS REQUEST]', JSON.stringify(entry, null, 2));
}

function issuePathToStringArray(
   path: [IssuePathItem, ...IssuePathItem[]]
): string[] {
   return path.map(item => {
      if (typeof item.key === 'string') return item.key;
      if (typeof item.key === 'number') return `[${item.key}]`;
      if (typeof item.key === 'symbol') return `[${item.key.toString()}]`;
      return '<unknown>';
   });
}

export function logSuspiciousRequest(
   req: Request,
   error: unknown,
   rawBody?: unknown
) {
   if (!isValiError(error)) return;

   const suspiciousFields: SuspiciousField[] = error.issues.map(issue => ({
      path: issue.path ? issuePathToStringArray(issue.path) : undefined,
      message: issue.message,
   }));

   if (suspiciousFields.length === 0) return;

   const entry: SuspiciousRequestLog = {
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
      method: req.method,
      ip: req.ip ?? '',
      userAgent: req.get('user-agent') || undefined,
      suspiciousFields,
      rawBody,
   };

   logToAuditTrail(entry);
}
