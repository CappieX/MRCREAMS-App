import React, { useEffect, useState } from 'react';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { BrandCard } from '../../components/custom/Card';
import { BrandText } from '../../components/custom/Typography';
import { BrandButton } from '../../components/custom/Button';

const AnalyticsHub = () => {
  const [trend, setTrend] = useState([]);
  const [heatmap, setHeatmap] = useState([]);
  const [retention, setRetention] = useState([]);
  const [geo, setGeo] = useState([]);
  const [peaks, setPeaks] = useState([]);
  const token = localStorage.getItem('authToken');

  const parseArray = async (res) => {
    try {
      const ct = res.headers.get('content-type') || '';
      if (!res.ok || !ct.includes('application/json')) return [];
      const data = await res.json();
      return Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
    } catch {
      return [];
    }
  };

  const load = async () => {
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const a = await fetch('/api/platform/analytics/conflicts-trend', { headers });
      setTrend(await parseArray(a));
    } catch { setTrend([]); }
    try {
      const b = await fetch('/api/platform/analytics/emotions-heatmap', { headers });
      setHeatmap(await parseArray(b));
    } catch { setHeatmap([]); }
    try {
      const c = await fetch('/api/platform/analytics/user-retention', { headers });
      setRetention(await parseArray(c));
    } catch { setRetention([]); }
    try {
      const d = await fetch('/api/platform/analytics/geographic', { headers });
      setGeo(await parseArray(d));
    } catch { setGeo([]); }
    try {
      const e = await fetch('/api/platform/analytics/usage-peaks', { headers });
      setPeaks(await parseArray(e));
    } catch { setPeaks([]); }
  };

  useEffect(() => { load(); }, []);

  const exportCSV = async () => {
    try {
      const res = await fetch('/api/platform/analytics/export', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) return;
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'analytics.csv';
      a.click();
      URL.revokeObjectURL(url);
    } catch {}
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16
      }}
    >
      <div>
        <BrandText variant="h2">Analytics</BrandText>
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
            title: 'Conflict trend',
            meta: 'Conflicts per day'
          }}
        >
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend.slice().reverse()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#0EA5E9" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </BrandCard>

        <BrandCard
          tone="surface"
          header={{
            title: 'Usage peaks',
            meta: 'Sessions per hour'
          }}
        >
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={peaks}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#8B5CF6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </BrandCard>
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
            title: 'Emotion categories',
            meta: 'Distribution across sessions'
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
            {heatmap.map((h) => (
              <div
                key={h.category || 'unknown'}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between'
                }}
              >
                <span>{h.category || 'Unknown'}</span>
                <span>{h.value}</span>
              </div>
            ))}
            {heatmap.length === 0 && (
              <span
                style={{
                  fontSize: 12,
                  color: 'rgba(148,163,184,0.9)'
                }}
              >
                No emotion data yet.
              </span>
            )}
          </div>
        </BrandCard>

        <BrandCard
          tone="surface"
          header={{
            title: 'Geographic',
            meta: 'Users by country'
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
            {geo.map((g) => (
              <div
                key={g.country || 'unknown-country'}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between'
                }}
              >
                <span>{g.country}</span>
                <span>{g.users}</span>
              </div>
            ))}
            {geo.length === 0 && (
              <span
                style={{
                  fontSize: 12,
                  color: 'rgba(148,163,184,0.9)'
                }}
              >
                No geographic data yet.
              </span>
            )}
          </div>
        </BrandCard>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          marginTop: 4
        }}
      >
        <BrandButton variant="outline" size="sm" onClick={exportCSV}>
          Export CSV
        </BrandButton>
      </div>
    </div>
  );
};

export default AnalyticsHub;
