import React, { useState, useEffect } from 'react';
import { BrandCard } from '../../components/custom/Card';
import { BrandText } from '../../components/custom/Typography';
import { BrandButton } from '../../components/custom/Button';
import { apiRequest } from '../../utils/apiService';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [query, setQuery] = useState('');
  const [actor, setActor] = useState('all');
  const [action, setAction] = useState('all');
  const [severity, setSeverity] = useState('all');
  const [selectedLog, setSelectedLog] = useState(null);

  useEffect(() => {
    fetchLogs();
  }, [page, rowsPerPage, actor, action, severity, query]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const offset = page * rowsPerPage;
      const data = await apiRequest(
        `/platform/audit-logs?limit=${rowsPerPage}&offset=${offset}`,
        'GET',
        null,
        token
      );
      let items = Array.isArray(data) ? data : [];
      items = items.filter(
        (i) =>
          (severity === 'all' || i.severity === severity) &&
          (actor === 'all' ||
            (actor === 'system'
              ? i.userEmail === 'system'
              : i.userEmail !== 'system')) &&
          (action === 'all' || i.action === action) &&
          (!query ||
            JSON.stringify(i).toLowerCase().includes(query.toLowerCase()))
      );
      setLogs(items);
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    const header = [
      'timestamp',
      'action',
      'userEmail',
      'userName',
      'resourceType',
      'severity'
    ];
    const rows = logs.map((l) => [
      new Date(l.createdAt).toISOString(),
      l.action,
      l.userEmail,
      l.userName,
      l.resourceType,
      l.severity
    ]);
    const csv = [header, ...rows]
      .map((r) => r.map((v) => `"${String(v || '')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'audit_logs.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loading && logs.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 260
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: '999px',
            border: '3px solid rgba(148,163,184,0.5)',
            borderTopColor: '#0EA5E9',
            animation: 'spin 900ms linear infinite'
          }}
        />
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16
      }}
    >
      <BrandText variant="h2">Audit logs</BrandText>

      <BrandCard
        tone="surface"
        header={{
          title: 'Filters',
          meta: 'Search and slice audit trail'
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'minmax(0, 1.6fr) repeat(3, minmax(0, 1fr)) minmax(0, 1.2fr)',
            gap: 12,
            alignItems: 'flex-end'
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 6
            }}
          >
            <label
              style={{
                fontSize: 12,
                color: 'rgba(148,163,184,0.95)'
              }}
            >
              Search
            </label>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="User, action, resource"
              style={{
                paddingInline: 10,
                paddingBlock: 8,
                borderRadius: 10,
                border: '1px solid rgba(148,163,184,0.7)',
                fontSize: 13
              }}
            />
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 6
            }}
          >
            <label
              style={{
                fontSize: 12,
                color: 'rgba(148,163,184,0.95)'
              }}
            >
              Actor
            </label>
            <select
              value={actor}
              onChange={(e) => setActor(e.target.value)}
              style={{
                paddingInline: 10,
                paddingBlock: 8,
                borderRadius: 10,
                border: '1px solid rgba(148,163,184,0.7)',
                fontSize: 13,
                backgroundColor: '#ffffff'
              }}
            >
              <option value="all">All</option>
              <option value="system">System</option>
              <option value="user">Users</option>
            </select>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 6
            }}
          >
            <label
              style={{
                fontSize: 12,
                color: 'rgba(148,163,184,0.95)'
              }}
            >
              Action
            </label>
            <select
              value={action}
              onChange={(e) => setAction(e.target.value)}
              style={{
                paddingInline: 10,
                paddingBlock: 8,
                borderRadius: 10,
                border: '1px solid rgba(148,163,184,0.7)',
                fontSize: 13,
                backgroundColor: '#ffffff'
              }}
            >
              <option value="all">All</option>
              <option value="LOGIN">LOGIN</option>
              <option value="UPDATE">UPDATE</option>
              <option value="DELETE">DELETE</option>
              <option value="ALERT">ALERT</option>
            </select>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 6
            }}
          >
            <label
              style={{
                fontSize: 12,
                color: 'rgba(148,163,184,0.95)'
              }}
            >
              Severity
            </label>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              style={{
                paddingInline: 10,
                paddingBlock: 8,
                borderRadius: 10,
                border: '1px solid rgba(148,163,184,0.7)',
                fontSize: 13,
                backgroundColor: '#ffffff'
              }}
            >
              <option value="all">All</option>
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 8
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
                flex: 1
              }}
            >
              <label
                style={{
                  fontSize: 12,
                  color: 'rgba(148,163,184,0.95)'
                }}
              >
                Rows per page
              </label>
              <select
                value={rowsPerPage}
                onChange={handleChangeRowsPerPage}
                style={{
                  paddingInline: 10,
                  paddingBlock: 8,
                  borderRadius: 10,
                  border: '1px solid rgba(148,163,184,0.7)',
                  fontSize: 13,
                  backgroundColor: '#ffffff'
                }}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
            <BrandButton size="md" variant="outline" onClick={exportCSV}>
              Export CSV
            </BrandButton>
          </div>
        </div>
      </BrandCard>

      <BrandCard
        tone="surface"
        header={{
          title: 'Audit trail'
        }}
      >
        <div
          style={{
            borderRadius: 14,
            border: '1px solid rgba(148,163,184,0.45)',
            overflow: 'hidden'
          }}
        >
          <table
            style={{
              width: '100%',
              borderCollapse: 'separate',
              borderSpacing: 0,
              fontSize: 12
            }}
          >
            <thead>
              <tr
                style={{
                  background:
                    'linear-gradient(90deg, rgba(15,23,42,0.02), rgba(15,23,42,0.04))'
                }}
              >
                {[
                  'Timestamp',
                  'Action',
                  'User',
                  'Resource',
                  'Severity',
                  'Details'
                ].map((col) => (
                  <th
                    key={col}
                    style={{
                      textAlign: 'left',
                      paddingInline: 14,
                      paddingBlock: 10,
                      fontWeight: 600,
                      color: 'rgba(15,23,42,0.75)',
                      borderBottom: '1px solid rgba(148,163,184,0.45)'
                    }}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.map((log, index) => {
                const stripe = index % 2 === 1;
                return (
                  <tr
                    key={log.id}
                    style={{
                      backgroundColor: stripe
                        ? 'rgba(248,250,252,0.7)'
                        : '#ffffff'
                    }}
                  >
                    <td
                      style={{
                        paddingInline: 14,
                        paddingBlock: 10,
                        borderBottom: '1px solid rgba(241,245,249,0.85)'
                      }}
                    >
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td
                      style={{
                        paddingInline: 14,
                        paddingBlock: 10,
                        borderBottom: '1px solid rgba(241,245,249,0.85)'
                      }}
                    >
                      {log.action}
                    </td>
                    <td
                      style={{
                        paddingInline: 14,
                        paddingBlock: 10,
                        borderBottom: '1px solid rgba(241,245,249,0.85)'
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column'
                        }}
                      >
                        <span>{log.userName}</span>
                        <span
                          style={{
                            fontSize: 11,
                            color: 'rgba(148,163,184,0.95)'
                          }}
                        >
                          {log.userEmail}
                        </span>
                      </div>
                    </td>
                    <td
                      style={{
                        paddingInline: 14,
                        paddingBlock: 10,
                        borderBottom: '1px solid rgba(241,245,249,0.85)'
                      }}
                    >
                      {log.resourceType}
                    </td>
                    <td
                      style={{
                        paddingInline: 14,
                        paddingBlock: 10,
                        borderBottom: '1px solid rgba(241,245,249,0.85)'
                      }}
                    >
                      {log.severity || 'info'}
                    </td>
                    <td
                      style={{
                        paddingInline: 14,
                        paddingBlock: 10,
                        borderBottom: '1px solid rgba(241,245,249,0.85)',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      <BrandButton
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedLog(log)}
                        style={{
                          fontSize: 11,
                          paddingInline: 10,
                          paddingBlock: 4
                        }}
                      >
                        View
                      </BrandButton>
                    </td>
                  </tr>
                );
              })}
              {logs.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    style={{
                      paddingInline: 14,
                      paddingBlock: 12,
                      fontSize: 12,
                      color: 'rgba(148,163,184,0.9)',
                      textAlign: 'center'
                    }}
                  >
                    No logs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div
          style={{
            marginTop: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: 12
          }}
        >
          <span
            style={{
              color: 'rgba(148,163,184,0.95)'
            }}
          >
            Page {page + 1}, showing {logs.length} rows
          </span>
          <div
            style={{
              display: 'flex',
              gap: 8
            }}
          >
            <BrandButton
              size="sm"
              variant="outline"
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              style={{
                fontSize: 11,
                paddingInline: 10,
                paddingBlock: 4
              }}
            >
              Previous
            </BrandButton>
            <BrandButton
              size="sm"
              variant="outline"
              disabled={logs.length < rowsPerPage}
              onClick={() => setPage((p) => p + 1)}
              style={{
                fontSize: 11,
                paddingInline: 10,
                paddingBlock: 4
              }}
            >
              Next
            </BrandButton>
          </div>
        </div>
      </BrandCard>

      {selectedLog && (
        <BrandCard
          tone="surface"
          header={{
            title: 'Log details',
            meta: selectedLog.action
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gap: 16,
              fontSize: 12
            }}
          >
            <div>
              <BrandText variant="h4">Request details</BrandText>
              <pre
                style={{
                  marginTop: 6,
                  maxHeight: 260,
                  overflow: 'auto',
                  backgroundColor: '#0F172A',
                  color: '#E5E7EB',
                  padding: 10,
                  borderRadius: 10,
                  fontSize: 11
                }}
              >
                {JSON.stringify(selectedLog.details, null, 2)}
              </pre>
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 12
              }}
            >
              {selectedLog.oldData && (
                <div>
                  <BrandText variant="h4">Previous data</BrandText>
                  <pre
                    style={{
                      marginTop: 6,
                      maxHeight: 120,
                      overflow: 'auto',
                      backgroundColor: '#020617',
                      color: '#E5E7EB',
                      padding: 10,
                      borderRadius: 10,
                      fontSize: 11
                    }}
                  >
                    {JSON.stringify(selectedLog.oldData, null, 2)}
                  </pre>
                </div>
              )}
              {selectedLog.newData && (
                <div>
                  <BrandText variant="h4">New data</BrandText>
                  <pre
                    style={{
                      marginTop: 6,
                      maxHeight: 120,
                      overflow: 'auto',
                      backgroundColor: '#020617',
                      color: '#E5E7EB',
                      padding: 10,
                      borderRadius: 10,
                      fontSize: 11
                    }}
                  >
                    {JSON.stringify(selectedLog.newData, null, 2)}
                  </pre>
                </div>
              )}
              <div>
                <BrandButton
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedLog(null)}
                  style={{
                    fontSize: 11,
                    paddingInline: 10,
                    paddingBlock: 4
                  }}
                >
                  Close
                </BrandButton>
              </div>
            </div>
          </div>
        </BrandCard>
      )}
    </div>
  );
};

export default AuditLogs;

