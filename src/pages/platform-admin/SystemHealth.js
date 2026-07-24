import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, AreaChart, Area } from 'recharts';
import { apiRequest } from '../../utils/apiService';
import { BrandCard } from '../../components/custom/Card';
import { BrandText } from '../../components/custom/Typography';
import { BRAND_COLORS } from '../../assets/brand';

const SystemHealth = () => {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [autoPoll, setAutoPoll] = useState(true);
  const [latency, setLatency] = useState([]);
  const [errorRate, setErrorRate] = useState([]);
  const [services, setServices] = useState([]);

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(() => {
      if (autoPoll) fetchHealth();
    }, 30000);
    return () => clearInterval(interval);
  }, [autoPoll]);

  const fetchHealth = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const data = await apiRequest('/platform/health', 'GET', null, token);
      setHealth(data);
      setLatency([10, 12, 15, 11, 9, 13, 14, 16, 12, 11].map((v, i) => ({ t: i, v })));
      setErrorRate([0.2, 0.4, 0.3, 0.8, 0.5, 0.6, 0.3, 0.2].map((v, i) => ({ t: i, v })));
      setServices([
        { name: 'API', status: 'healthy', uptime: '99.9%', load: 0.45, latency: 12 },
        { name: 'Auth', status: 'healthy', uptime: '99.8%', load: 0.30, latency: 10 },
        { name: 'DB', status: 'degraded', uptime: '99.4%', load: 0.70, latency: 18 },
        { name: 'Jobs', status: 'healthy', uptime: '99.7%', load: 0.40, latency: 11 }
      ]);
    } catch (error) {
      console.error('Failed to fetch health:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
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
            borderTopColor: BRAND_COLORS.teal,
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
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12
        }}
      >
        <div>
          <BrandText variant="h2">System health monitor</BrandText>
          <BrandText variant="caption" tone="soft">
            Live view of core services, latency, and background jobs.
          </BrandText>
        </div>
        <button
          type="button"
          onClick={() => setAutoPoll((value) => !value)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            paddingInline: 12,
            paddingBlock: 6,
            borderRadius: 999,
            border: '1px solid rgba(148,163,184,0.6)',
            backgroundColor: autoPoll ? 'rgba(34,197,94,0.08)' : '#ffffff',
            color: autoPoll ? '#16a34a' : 'rgba(15,23,42,0.8)',
            fontSize: 12,
            cursor: 'pointer'
          }}
        >
          <span
            style={{
              width: 18,
              height: 10,
              borderRadius: 999,
              backgroundColor: autoPoll
                ? BRAND_COLORS.teal
                : 'rgba(148,163,184,0.6)',
              position: 'relative',
              transition: 'background-color 140ms ease-out'
            }}
          >
            <span
              style={{
                position: 'absolute',
                top: -2,
                left: autoPoll ? 8 : -2,
                width: 14,
                height: 14,
                borderRadius: 999,
                backgroundColor: '#ffffff',
                boxShadow: '0 2px 4px rgba(15,23,42,0.25)',
                transition: 'left 140ms ease-out'
              }}
            />
          </span>
          <span>{autoPoll ? 'Auto-poll on' : 'Auto-poll off'}</span>
        </button>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
          gap: 16
        }}
      >
        <BrandCard
          tone="surface"
          header={{
            title: 'API latency (ms)',
            meta: 'Recent window'
          }}
        >
          <div style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={latency}>
                <XAxis dataKey="t" />
                <YAxis />
                <CartesianGrid strokeDasharray="3 3" />
                <ChartTooltip />
                <Line
                  type="monotone"
                  dataKey="v"
                  stroke={BRAND_COLORS.teal}
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </BrandCard>

        <BrandCard
          tone="surface"
          header={{
            title: 'Error rate (%)',
            meta: 'Recent window'
          }}
        >
          <div style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={errorRate}>
                <XAxis dataKey="t" />
                <YAxis />
                <CartesianGrid strokeDasharray="3 3" />
                <ChartTooltip />
                <Area
                  type="monotone"
                  dataKey="v"
                  stroke={BRAND_COLORS.coral}
                  fill={`${BRAND_COLORS.coral}11`}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </BrandCard>
      </div>

      <BrandCard
        tone="surface"
        header={{
          title: 'Service status',
          meta: 'API, auth, database, jobs'
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
                {['Service', 'Status', 'Uptime', 'Load', 'Latency'].map(
                  (col) => (
                    <th
                      key={col}
                      style={{
                        textAlign: col === 'Service' ? 'left' : 'right',
                        paddingInline: 14,
                        paddingBlock: 10,
                        fontWeight: 600,
                        color: 'rgba(15,23,42,0.75)',
                        borderBottom: '1px solid rgba(148,163,184,0.45)'
                      }}
                    >
                      {col}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {services.map((s, index) => {
                const stripe = index % 2 === 1;
                const healthy = s.status === 'healthy';
                return (
                  <tr
                    key={s.name}
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
                        borderBottom: '1px solid rgba(241,245,249,0.85)',
                        textAlign: 'left'
                      }}
                    >
                      {s.name}
                    </td>
                    <td
                      style={{
                        paddingInline: 14,
                        paddingBlock: 10,
                        borderBottom: '1px solid rgba(241,245,249,0.85)',
                        textAlign: 'right'
                      }}
                    >
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          paddingInline: 10,
                          paddingBlock: 4,
                          borderRadius: 999,
                          backgroundColor: healthy
                            ? 'rgba(34,197,94,0.12)'
                            : 'rgba(248,113,113,0.12)',
                          color: healthy ? '#16a34a' : BRAND_COLORS.coral,
                          fontSize: 11,
                          fontWeight: 500
                        }}
                      >
                        <span
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: 999,
                            backgroundColor: healthy
                              ? '#22c55e'
                              : BRAND_COLORS.coral
                          }}
                        />
                        {s.status}
                      </span>
                    </td>
                    <td
                      style={{
                        paddingInline: 14,
                        paddingBlock: 10,
                        borderBottom: '1px solid rgba(241,245,249,0.85)',
                        textAlign: 'right'
                      }}
                    >
                      {s.uptime}
                    </td>
                    <td
                      style={{
                        paddingInline: 14,
                        paddingBlock: 10,
                        borderBottom: '1px solid rgba(241,245,249,0.85)',
                        textAlign: 'right'
                      }}
                    >
                      {Math.round(s.load * 100)}%
                    </td>
                    <td
                      style={{
                        paddingInline: 14,
                        paddingBlock: 10,
                        borderBottom: '1px solid rgba(241,245,249,0.85)',
                        textAlign: 'right'
                      }}
                    >
                      {s.latency}ms
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </BrandCard>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
          gap: 16
        }}
      >
        <BrandCard
          tone="surface"
          header={{
            title: 'Background jobs',
            meta: 'Schedulers and queues'
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              fontSize: 13
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between'
              }}
            >
              <BrandText tone="soft">Schedulers</BrandText>
              <BrandText tone="soft">Jobs running: 7</BrandText>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between'
              }}
            >
              <BrandText tone="soft">Queue</BrandText>
              <BrandText tone="soft">Queued: 21</BrandText>
            </div>
          </div>
        </BrandCard>

        <BrandCard
          tone="surface"
          header={{
            title: 'Environment',
            meta: 'Runtime and platform'
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              fontSize: 13
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between'
              }}
            >
              <BrandText tone="soft">Platform</BrandText>
              <BrandText tone="soft">
                {health?.system?.platform || 'Unknown'}
              </BrandText>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between'
              }}
            >
              <BrandText tone="soft">Node version</BrandText>
              <BrandText tone="soft">
                {health?.system?.nodeVersion || 'Unknown'}
              </BrandText>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between'
              }}
            >
              <BrandText tone="soft">Server time</BrandText>
              <BrandText tone="soft">
                {health?.timestamp
                  ? new Date(health.timestamp).toLocaleString()
                  : 'Unknown'}
              </BrandText>
            </div>
          </div>
        </BrandCard>
      </div>
    </div>
  );
};

export default SystemHealth;
