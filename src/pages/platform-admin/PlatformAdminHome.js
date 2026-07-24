import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { BrandCard } from '../../components/custom/Card';
import { BrandText } from '../../components/custom/Typography';
import { BrandButton } from '../../components/custom/Button';
import StatsCard from '../../components/custom/dashboard/StatsCard';
import ChartContainer from '../../components/custom/dashboard/ChartContainer';
import { LoadingState } from '../../components/custom/CustomUI';
import { apiRequest } from '../../utils/apiService';

const PlatformAdminHome = () => {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState({ users: 0, requests: 0, errorRate: 0, jobs: { running: 0, queued: 0 } });
  const [flags, setFlags] = useState({});
  const [alerts, setAlerts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchHealth();
    fetchOverview();
    fetchConfig();
    fetchAlerts();
  }, []);

  const fetchHealth = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const data = await apiRequest('/platform/health', 'GET', null, token);
      setHealth(data);
    } catch (error) {
      console.error('Failed to fetch health data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOverview = async () => {
    try {
      const token = localStorage.getItem('authToken');
      await apiRequest('/analytics', 'GET', null, token);
      setOverview({ users: 1428, requests: 124350, errorRate: 0.9, jobs: { running: 7, queued: 21 } });
    } catch (_) {
      setOverview({ users: 1428, requests: 124350, errorRate: 0.9, jobs: { running: 7, queued: 21 } });
    }
  };

  const fetchConfig = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const data = await apiRequest('/platform/config', 'GET', null, token);
      setFlags(data.allFlags || {});
    } catch (_) {
      setFlags({ maintenance_mode: { enabled: false }, beta_features: { enabled: true } });
    }
  };

  const fetchAlerts = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const data = await apiRequest('/platform/audit-logs?limit=10', 'GET', null, token);
      const critical = Array.isArray(data) ? data.filter(l => l.severity === 'critical' || l.action === 'ALERT') : [];
      setAlerts(critical);
    } catch (_) {
      setAlerts([]);
    }
  };

  if (loading) {
    return <LoadingState label="Loading platform overview" />;
  }

  const statusColor = health?.status === 'healthy' ? '#16a34a' : '#dc2626';

  const tools = [
    { label: 'System Health', path: '/dashboard/platform-admin/health' },
    { label: 'Audit Logs', path: '/dashboard/platform-admin/logs' },
    { label: 'Configuration', path: '/dashboard/platform-admin/config' },
    { label: 'User Management', path: '/dashboard/platform-admin/users' },
    { label: 'Conflicts Admin', path: '/dashboard/platform-admin/conflicts' },
    { label: 'Professionals', path: '/dashboard/platform-admin/professionals' },
    { label: 'Analytics Hub', path: '/dashboard/platform-admin/analytics' },
    { label: 'Notification Center', path: '/dashboard/platform-admin/notifications' },
    { label: 'Database Management', path: '/dashboard/platform-admin/database' },
    { label: 'Payment Gateways', path: '/dashboard/platform-admin/config' }
  ];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16
      }}
    >
      <BrandText variant="h2">Platform overview</BrandText>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 12
        }}
      >
        <BrandCard tone="surface">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12
            }}
          >
            <div>
              <BrandText variant="caption" tone="muted">
                System status
              </BrandText>
              <BrandText
                variant="h2"
                style={{
                  fontSize: 22,
                  color: statusColor
                }}
              >
                {health?.status?.toUpperCase() || 'UNKNOWN'}
              </BrandText>
              <BrandText variant="caption" tone="soft">
                Last heartbeat: {new Date(health?.timestamp || Date.now()).toLocaleTimeString()}
              </BrandText>
            </div>
            <div
              style={{
                minWidth: 80,
                textAlign: 'right',
                fontSize: 12,
                color: 'rgba(15,23,42,0.7)'
              }}
            >
              {health?.lastError || 'OK'}
            </div>
          </div>
        </BrandCard>

        <BrandCard tone="surface">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12
            }}
          >
            <div>
              <BrandText variant="caption" tone="muted">
                Database
              </BrandText>
              <BrandText variant="h3">
                {health?.database?.status === 'connected' ? 'Connected' : 'Disconnected'}
              </BrandText>
              <BrandText variant="caption" tone="soft">
                Latency: {health?.database?.latency || 'N/A'}
              </BrandText>
              <BrandText variant="caption" tone="soft">
                Connections: {health?.database?.connections || 12}
              </BrandText>
              <span
                style={{
                  display: 'inline-flex',
                  marginTop: 4,
                  paddingInline: 8,
                  paddingBlock: 2,
                  borderRadius: 999,
                  fontSize: 11,
                  backgroundColor: 'rgba(148,163,184,0.16)',
                  color: 'rgba(15,23,42,0.8)'
                }}
              >
                {health?.database?.rw || 'RW'}
              </span>
            </div>
          </div>
        </BrandCard>

        <BrandCard tone="surface">
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8
            }}
          >
            <BrandText variant="caption" tone="muted">
              Uptime
            </BrandText>
            <BrandText variant="h3">
              {health?.uptime
                ? `${Math.floor(health.uptime / 3600)}h ${Math.floor((health.uptime % 3600) / 60)}m`
                : 'N/A'}
            </BrandText>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 6
              }}
            >
              {[
                { label: '24h 99.9%', tone: 'ok' },
                { label: '7d 99.7%', tone: 'ok' },
                { label: '30d 99.4%', tone: 'warn' }
              ].map((item) => (
                <span
                  key={item.label}
                  style={{
                    fontSize: 11,
                    paddingInline: 8,
                    paddingBlock: 3,
                    borderRadius: 999,
                    backgroundColor:
                      item.tone === 'warn' ? 'rgba(251,191,36,0.16)' : 'rgba(22,163,74,0.14)',
                    color: item.tone === 'warn' ? '#92400e' : '#166534'
                  }}
                >
                  {item.label}
                </span>
              ))}
            </div>
          </div>
        </BrandCard>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 12
        }}
      >
        <StatsCard label="Active users" value={overview.users} />
        <StatsCard label="API requests (24h)" value={overview.requests} />
        <StatsCard label="Error rate" value={`${overview.errorRate}%`} accent="coral" />
        <StatsCard
          label="Jobs"
          value={`${overview.jobs.running} running / ${overview.jobs.queued} queued`}
          accent="navy"
        />
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.3fr) minmax(0, 1.3fr)',
          gap: 16
        }}
      >
        <BrandCard
          tone="surface"
          header={{
            title: 'Admin alert center',
            meta: 'Critical incidents from audit logs'
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: 10
            }}
          >
            {alerts.length === 0 &&
              (
                <div
                  style={{
                    fontSize: 13,
                    color: 'rgba(148,163,184,0.95)'
                  }}
                >
                  No critical incidents
                </div>
              )}
            {alerts.map((a, i) => (
              <div
                key={`${a.id || a.createdAt || i}-${i}`}
                style={{
                  paddingInline: 12,
                  paddingBlock: 8,
                  borderRadius: 10,
                  border: '1px solid rgba(248,113,113,0.65)',
                  backgroundColor: 'rgba(254,242,242,0.9)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 8
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2
                  }}
                >
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: '#b91c1c'
                    }}
                  >
                    {a.action}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      color: 'rgba(148,163,184,0.95)'
                    }}
                  >
                    {new Date(a.createdAt).toLocaleString()}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: 11,
                    paddingInline: 8,
                    paddingBlock: 3,
                    borderRadius: 999,
                    backgroundColor: '#b91c1c',
                    color: '#ffffff'
                  }}
                >
                  Critical
                </span>
              </div>
            ))}
          </div>
        </BrandCard>

        <BrandCard
          tone="surface"
          header={{
            title: 'Feature flags',
            meta: 'Operational and beta toggles'
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 10
            }}
          >
            {Object.entries(flags).map(([key, value]) => (
              <div
                key={key}
                style={{
                  paddingInline: 12,
                  paddingBlock: 8,
                  borderRadius: 10,
                  border: '1px solid rgba(226,232,240,0.9)',
                  backgroundColor: 'rgba(248,250,252,0.9)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 8
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2
                  }}
                >
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: '#0f172a'
                    }}
                  >
                    {key}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      color: 'rgba(148,163,184,0.95)'
                    }}
                  >
                    {value.description || ''}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: 11,
                    paddingInline: 8,
                    paddingBlock: 3,
                    borderRadius: 999,
                    backgroundColor: value.enabled
                      ? 'rgba(22,163,74,0.16)'
                      : 'rgba(148,163,184,0.16)',
                    color: value.enabled ? '#166534' : 'rgba(15,23,42,0.7)'
                  }}
                >
                  {value.enabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            ))}
          </div>
        </BrandCard>
      </div>

      <ChartContainer
        title="System intelligence"
        meta="High-level performance across core services"
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={[
              { t: '00:00', v: 100 },
              { t: '06:00', v: 260 },
              { t: '12:00', v: 450 },
              { t: '18:00', v: 300 },
              { t: '24:00', v: 180 }
            ]}
          >
            <defs>
              <linearGradient id="platform-home-color-v" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="t" />
            <YAxis />
            <CartesianGrid strokeDasharray="3 3" />
            <ChartTooltip />
            <Area
              type="monotone"
              dataKey="v"
              stroke="#0ea5e9"
              fillOpacity={1}
              fill="url(#platform-home-color-v)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartContainer>

      <BrandCard
        tone="surface"
        header={{
          title: 'Tools',
          meta: 'Deep dive into specific areas'
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
            gap: 10
          }}
        >
          {tools.map((tool) => (
            <div
              key={tool.label}
              style={{
                paddingInline: 12,
                paddingBlock: 10,
                borderRadius: 12,
                border: '1px solid rgba(226,232,240,0.9)',
                backgroundColor: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 8
              }}
            >
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: '#0f172a'
                }}
              >
                {tool.label}
              </span>
              <BrandButton
                size="sm"
                variant="outline"
                onClick={() => navigate(tool.path)}
              >
                Open
              </BrandButton>
            </div>
          ))}
        </div>
      </BrandCard>

      <BrandCard
        tone="surface"
        header={{
          title: 'Quick actions',
          meta: 'Shortcuts for frequent operations'
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 10
          }}
        >
          <BrandButton
            size="md"
            onClick={() => navigate('/dashboard/platform-admin/health')}
          >
            View detailed health
          </BrandButton>
          <BrandButton
            size="md"
            variant="outline"
            onClick={() => navigate('/dashboard/platform-admin/logs')}
          >
            View audit logs
          </BrandButton>
          <BrandButton
            size="md"
            variant="outline"
            onClick={() => navigate('/dashboard/platform-admin/config')}
          >
            System configuration
          </BrandButton>
        </div>
      </BrandCard>
    </div>
  );
};

export default PlatformAdminHome;
