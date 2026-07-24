import React, { useEffect, useState } from 'react';
import { BrandCard } from '../../components/custom/Card';
import { BrandText } from '../../components/custom/Typography';

const Professionals = () => {
  const [queue, setQueue] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [availability, setAvailability] = useState([]);

  const token = localStorage.getItem('authToken');

  const loadQueue = async () => {
    try {
      const res = await fetch('/api/platform/professionals/verification-queue', { headers: { Authorization: `Bearer ${token}` } });
      setQueue(res.ok ? await res.json() : []);
    } catch {
      setQueue([]);
    }
  };

  const loadMetrics = async () => {
    try {
      const res = await fetch('/api/platform/professionals/metrics', { headers: { Authorization: `Bearer ${token}` } });
      setMetrics(res.ok ? await res.json() : null);
    } catch {
      setMetrics(null);
    }
  };

  const loadAvailability = async () => {
    try {
      const res = await fetch('/api/platform/professionals/availability', { headers: { Authorization: `Bearer ${token}` } });
      setAvailability(res.ok ? await res.json() : []);
    } catch {
      setAvailability([]);
    }
  };

  useEffect(() => { loadQueue(); loadMetrics(); loadAvailability(); }, []);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16
      }}
    >
      <BrandText variant="h2">Professionals</BrandText>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 0.9fr) minmax(0, 1.4fr)',
          gap: 16
        }}
      >
        <BrandCard
          tone="surface"
          header={{
            title: 'Performance overview'
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              fontSize: 13
            }}
          >
            {metrics ? (
              <>
                <span>Total therapists: {metrics.totalTherapists}</span>
                <span>Active therapists: {metrics.activeTherapists}</span>
                <span>
                  Avg sessions per therapist:{' '}
                  {metrics.averageSessionsPerTherapist}
                </span>
                <span>Client satisfaction: {metrics.clientSatisfaction}</span>
              </>
            ) : (
              <span
                style={{
                  fontSize: 12,
                  color: 'rgba(148,163,184,0.9)'
                }}
              >
                No performance data available yet.
              </span>
            )}
          </div>
        </BrandCard>

        <BrandCard
          tone="surface"
          header={{
            title: 'Verification queue'
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
                  {['User', 'Email', 'Status', 'License', 'Reviewed'].map(
                    (col) => (
                      <th
                        key={col}
                        style={{
                          textAlign: 'left',
                          paddingInline: 14,
                          paddingBlock: 10,
                          fontWeight: 600,
                          color: 'rgba(15,23,42,0.75)',
                          borderBottom:
                            '1px solid rgba(148,163,184,0.45)'
                        }}
                      >
                        {col}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {queue.map((q, index) => {
                  const stripe = index % 2 === 1;
                  return (
                    <tr
                      key={q.user_id}
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
                          borderBottom:
                            '1px solid rgba(241,245,249,0.85)',
                          textAlign: 'left'
                        }}
                      >
                        {q.name}
                      </td>
                      <td
                        style={{
                          paddingInline: 14,
                          paddingBlock: 10,
                          borderBottom:
                            '1px solid rgba(241,245,249,0.85)',
                          textAlign: 'left'
                        }}
                      >
                        {q.email}
                      </td>
                      <td
                        style={{
                          paddingInline: 14,
                          paddingBlock: 10,
                          borderBottom:
                            '1px solid rgba(241,245,249,0.85)',
                          textAlign: 'left'
                        }}
                      >
                        {q.status}
                      </td>
                      <td
                        style={{
                          paddingInline: 14,
                          paddingBlock: 10,
                          borderBottom:
                            '1px solid rgba(241,245,249,0.85)',
                          textAlign: 'left'
                        }}
                      >
                        {q.license_number} {q.license_state}
                      </td>
                      <td
                        style={{
                          paddingInline: 14,
                          paddingBlock: 10,
                          borderBottom:
                            '1px solid rgba(241,245,249,0.85)',
                          textAlign: 'left'
                        }}
                      >
                        {q.reviewed_at
                          ? new Date(
                              q.reviewed_at
                            ).toLocaleDateString()
                          : '-'}
                      </td>
                    </tr>
                  );
                })}
                {queue.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      style={{
                        paddingInline: 14,
                        paddingBlock: 12,
                        fontSize: 12,
                        color: 'rgba(148,163,184,0.9)',
                        textAlign: 'center'
                      }}
                    >
                      No verification items in the queue.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </BrandCard>
      </div>

      <BrandCard
        tone="surface"
        header={{
          title: 'Availability'
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
                {['Therapist', 'Scheduled at', 'Status'].map((col) => (
                  <th
                    key={col}
                    style={{
                      textAlign: 'left',
                      paddingInline: 14,
                      paddingBlock: 10,
                      fontWeight: 600,
                      color: 'rgba(15,23,42,0.75)',
                      borderBottom:
                        '1px solid rgba(148,163,184,0.45)'
                    }}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {availability.map((a, index) => {
                const stripe = index % 2 === 1;
                return (
                  <tr
                    key={`${a.therapist_id}-${a.scheduled_at}`}
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
                        borderBottom:
                          '1px solid rgba(241,245,249,0.85)',
                        textAlign: 'left'
                      }}
                    >
                      {a.therapist_name}
                    </td>
                    <td
                      style={{
                        paddingInline: 14,
                        paddingBlock: 10,
                        borderBottom:
                          '1px solid rgba(241,245,249,0.85)',
                        textAlign: 'left'
                      }}
                    >
                      {new Date(a.scheduled_at).toLocaleString()}
                    </td>
                    <td
                      style={{
                        paddingInline: 14,
                        paddingBlock: 10,
                        borderBottom:
                          '1px solid rgba(241,245,249,0.85)',
                        textAlign: 'left'
                      }}
                    >
                      {a.status}
                    </td>
                  </tr>
                );
              })}
              {availability.length === 0 && (
                <tr>
                  <td
                    colSpan={3}
                    style={{
                      paddingInline: 14,
                      paddingBlock: 12,
                      fontSize: 12,
                      color: 'rgba(148,163,184,0.9)',
                      textAlign: 'center'
                    }}
                  >
                    No upcoming availability.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </BrandCard>
    </div>
  );
};

export default Professionals;
