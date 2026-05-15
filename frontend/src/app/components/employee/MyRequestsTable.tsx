import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { RequestStatusBadge } from './RequestStatusBadge';

export function MyRequestsTable() {
  const requests = useSelector((state: RootState) => state.requests.requests);

  if (requests.length === 0) {
    return (
      <div className="p-6 rounded-lg border border-border bg-card text-center text-sm text-muted-foreground">
        You have no profile update requests.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-secondary/50 text-xs uppercase text-muted-foreground border-b border-border">
            <tr>
              <th className="px-4 py-3 font-medium">Field</th>
              <th className="px-4 py-3 font-medium">Old Value</th>
              <th className="px-4 py-3 font-medium">New Value</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Requested Date</th>
              <th className="px-4 py-3 font-medium">Admin Remark</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {requests.map((request) => (
              <React.Fragment key={request.id}>
                {request.changes.map((change, idx) => (
                  <tr key={`${request.id}-${idx}`} className="hover:bg-secondary/20 transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground">{change.fieldLabel || change.fieldName}</td>
                    <td className="px-4 py-3 text-muted-foreground truncate max-w-[200px]" title={String(change.oldValue || '')}>{String(change.oldValue || '-')}</td>
                    <td className="px-4 py-3 text-foreground truncate max-w-[200px]" title={String(change.newValue || '')}>{String(change.newValue || '-')}</td>
                    <td className="px-4 py-3">
                      <RequestStatusBadge status={request.status} />
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs italic truncate max-w-[200px]">
                      {request.rejectionComment || '-'}
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
