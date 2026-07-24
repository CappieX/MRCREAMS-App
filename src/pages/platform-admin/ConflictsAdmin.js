import React, { useEffect, useState } from 'react';
import { BrandCard } from '../../components/custom/Card';
import { BrandText } from '../../components/custom/Typography';
import { BrandButton } from '../../components/custom/Button';

const ConflictsAdmin = () => {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('all');
  const [intensity, setIntensity] = useState('all');
  const [duration, setDuration] = useState('all');
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);

  const fetchList = async () => {
    const token = localStorage.getItem('authToken');
    const res = await fetch(`/api/platform/conflicts?status=${status}&intensity=${intensity}&duration=${duration}`, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setItems(Array.isArray(data) ? data : []);
  };

  const fetchDetail = async (id) => {
    const token = localStorage.getItem('authToken');
    const res = await fetch(`/api/platform/conflicts/${id}`, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setDetail(data);
  };

  useEffect(() => { fetchList(); }, [status, intensity, duration]);

  const escalate = async (id) => {
    const token = localStorage.getItem('authToken');
    await fetch(`/api/platform/conflicts/${id}/escalate`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ reason: 'High intensity' }) });
  };

  const exportData = async () => {
    const token = localStorage.getItem('authToken');
    const res = await fetch('/api/platform/conflicts/export', { headers: { Authorization: `Bearer ${token}` } });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'conflicts.csv'; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16
      }}
    >
      <BrandText variant="h2">Conflicts</BrandText>

      <BrandCard
        tone="surface"
        header={{
          title: 'Filters',
          meta: 'Narrow down active conflicts'
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
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
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
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
              <option value="open">Open</option>
              <option value="resolved">Resolved</option>
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
              Intensity
            </label>
            <select
              value={intensity}
              onChange={(e) => setIntensity(e.target.value)}
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
              <option value="5">≥ 5</option>
              <option value="7">≥ 7</option>
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
              Duration
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
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
              <option value="30">≥ 30m</option>
              <option value="60">≥ 60m</option>
            </select>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 8
            }}
          >
            <BrandButton
              size="md"
              variant="outline"
              onClick={exportData}
            >
              Export CSV
            </BrandButton>
          </div>
        </div>
      </BrandCard>

      <BrandCard
        tone="surface"
        header={{
          title: 'Conflict list'
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
                  'ID',
                  'User',
                  'Reason',
                  'Intensity',
                  'Duration',
                  'Result',
                  'Actions'
                ].map((col) => (
                  <th
                    key={col}
                    style={{
                      textAlign: col === 'Reason' ? 'left' : 'left',
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
              {items.map((c, index) => {
                const stripe = index % 2 === 1;
                return (
                  <tr
                    key={c.id}
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
                          '1px solid rgba(241,245,249,0.85)'
                      }}
                    >
                      {c.id}
                    </td>
                    <td
                      style={{
                        paddingInline: 14,
                        paddingBlock: 10,
                        borderBottom:
                          '1px solid rgba(241,245,249,0.85)'
                      }}
                    >
                      {c.user_id}
                    </td>
                    <td
                      style={{
                        paddingInline: 14,
                        paddingBlock: 10,
                        borderBottom:
                          '1px solid rgba(241,245,249,0.85)'
                      }}
                    >
                      {c.conflict_reason}
                    </td>
                    <td
                      style={{
                        paddingInline: 14,
                        paddingBlock: 10,
                        borderBottom:
                          '1px solid rgba(241,245,249,0.85)'
                      }}
                    >
                      {c.fight_degree}
                    </td>
                    <td
                      style={{
                        paddingInline: 14,
                        paddingBlock: 10,
                        borderBottom:
                          '1px solid rgba(241,245,249,0.85)'
                      }}
                    >
                      {c.time_consumption}
                    </td>
                    <td
                      style={{
                        paddingInline: 14,
                        paddingBlock: 10,
                        borderBottom:
                          '1px solid rgba(241,245,249,0.85)'
                      }}
                    >
                      {c.final_result}
                    </td>
                    <td
                      style={{
                        paddingInline: 14,
                        paddingBlock: 10,
                        borderBottom:
                          '1px solid rgba(241,245,249,0.85)',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      <BrandButton
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelected(c);
                          fetchDetail(c.id);
                        }}
                        style={{
                          fontSize: 11,
                          paddingInline: 10,
                          paddingBlock: 4,
                          marginRight: 6
                        }}
                      >
                        View
                      </BrandButton>
                      <BrandButton
                        size="sm"
                        onClick={() => escalate(c.id)}
                        style={{
                          fontSize: 11,
                          paddingInline: 10,
                          paddingBlock: 4
                        }}
                      >
                        Escalate
                      </BrandButton>
                    </td>
                  </tr>
                );
              })}
              {items.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    style={{
                      paddingInline: 14,
                      paddingBlock: 12,
                      fontSize: 12,
                      color: 'rgba(148,163,184,0.9)',
                      textAlign: 'center'
                    }}
                  >
                    No conflicts match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </BrandCard>

      {selected && detail && (
        <BrandCard
          tone="surface"
          header={{
            title: 'Conflict detail',
            meta: `ID ${selected.id}`
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
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <BrandText variant="h4">
                {detail.conflict.conflict_reason}
              </BrandText>
              <BrandButton
                size="sm"
                variant="outline"
                onClick={() => {
                  setSelected(null);
                  setDetail(null);
                }}
                style={{
                  fontSize: 11,
                  paddingInline: 10,
                  paddingBlock: 4
                }}
              >
                Close
              </BrandButton>
            </div>
            <span>
              User: {detail.conflict.user_name} (
              {detail.conflict.user_email})
            </span>
            <span>Timeline entries: {detail.timeline.length}</span>
            <span>
              Resolution score: {detail.resolutionProgress.score}
            </span>
          </div>
        </BrandCard>
      )}
    </div>
  );
};

export default ConflictsAdmin;
