import React, { useEffect, useState } from 'react';
import { BrandCard } from '../../components/custom/Card';
import { BrandText } from '../../components/custom/Typography';
import { BrandButton } from '../../components/custom/Button';

const NotificationCenter = () => {
  const [items, setItems] = useState([]);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState('info');
  const [segment, setSegment] = useState('all');
  const [schedule, setSchedule] = useState('');

  const token = localStorage.getItem('authToken');

  const load = async () => {
    try {
      const res = await fetch('/api/platform/notifications', { headers: { Authorization: `Bearer ${token}` } });
      setItems(res.ok ? await res.json() : []);
    } catch {
      setItems([]);
    }
  };

  useEffect(() => { load(); }, []);

  const broadcast = async () => {
    try {
      const res = await fetch('/api/platform/broadcast', { method: 'POST', headers: { 'Content-Type':'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ message, severity, target: segment }) });
      if (!res.ok) return;
      setMessage('');
      load();
    } catch {}
  };

  const createNotification = async () => {
    try {
      const res = await fetch('/api/platform/notifications', { method: 'POST', headers: { 'Content-Type':'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ title, message, severity, segment }) });
      if (!res.ok) return;
      setTitle(''); setMessage('');
      load();
    } catch {}
  };

  const scheduleAnnouncement = async () => {
    try {
      const res = await fetch('/api/platform/notifications/schedule', { method: 'POST', headers: { 'Content-Type':'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ title, message, severity, scheduledFor: schedule }) });
      if (!res.ok) return;
      setSchedule('');
      load();
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
      <BrandText variant="h2">Notification Center</BrandText>

      <BrandCard
        tone="surface"
        header={{
          title: 'Compose notification',
          meta: 'Broadcast or schedule announcements'
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 2fr)',
            gap: 12,
            alignItems: 'flex-end'
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8
            }}
          >
            <label
              style={{
                fontSize: 12,
                color: 'rgba(148,163,184,0.95)'
              }}
            >
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="System maintenance window"
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
              gap: 8
            }}
          >
            <label
              style={{
                fontSize: 12,
                color: 'rgba(148,163,184,0.95)'
              }}
            >
              Message
            </label>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe what users should know"
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
              gap: 8
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
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
            </select>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8
            }}
          >
            <label
              style={{
                fontSize: 12,
                color: 'rgba(148,163,184,0.95)'
              }}
            >
              Segment
            </label>
            <select
              value={segment}
              onChange={(e) => setSegment(e.target.value)}
              style={{
                paddingInline: 10,
                paddingBlock: 8,
                borderRadius: 10,
                border: '1px solid rgba(148,163,184,0.7)',
                fontSize: 13,
                backgroundColor: '#ffffff'
              }}
            >
              <option value="all">All users</option>
              <option value="therapists">Therapists</option>
              <option value="users">End users</option>
            </select>
          </div>

          <div
            style={{
              display: 'flex',
              gap: 8
            }}
          >
            <BrandButton
              size="md"
              onClick={createNotification}
              style={{ width: '100%' }}
            >
              Notify
            </BrandButton>
            <BrandButton
              size="md"
              variant="outline"
              onClick={broadcast}
              style={{ width: '100%' }}
            >
              Broadcast
            </BrandButton>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8
            }}
          >
            <label
              style={{
                fontSize: 12,
                color: 'rgba(148,163,184,0.95)'
              }}
            >
              Schedule (ISO)
            </label>
            <input
              type="text"
              value={schedule}
              onChange={(e) => setSchedule(e.target.value)}
              placeholder="2026-01-16T18:00:00Z"
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
              alignItems: 'flex-end'
            }}
          >
            <BrandButton
              size="md"
              variant="outline"
              onClick={scheduleAnnouncement}
            >
              Schedule
            </BrandButton>
          </div>
        </div>
      </BrandCard>

      <BrandCard
        tone="surface"
        header={{
          title: 'Recent notifications'
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
          {items.map((n) => (
            <div
              key={n.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                paddingInline: 12,
                paddingBlock: 8,
                borderRadius: 10,
                border: '1px solid rgba(226,232,240,0.9)',
                backgroundColor: 'rgba(248,250,252,0.9)'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: 4
                }}
              >
                <span
                  style={{
                    fontWeight: 500
                  }}
                >
                  {n.title} ({n.severity})
                </span>
                <span
                  style={{
                    fontSize: 11,
                    color: 'rgba(148,163,184,0.95)'
                  }}
                >
                  {new Date(n.createdAt).toLocaleString()}
                </span>
              </div>
              <span
                style={{
                  fontSize: 12,
                  color: 'rgba(15,23,42,0.8)'
                }}
              >
                {n.message}
              </span>
            </div>
          ))}
          {items.length === 0 && (
            <span
              style={{
                fontSize: 12,
                color: 'rgba(148,163,184,0.9)'
              }}
            >
              No notifications have been sent yet.
            </span>
          )}
        </div>
      </BrandCard>
    </div>
  );
};

export default NotificationCenter;
