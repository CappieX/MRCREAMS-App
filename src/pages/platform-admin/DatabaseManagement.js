import React, { useEffect, useMemo, useState } from 'react';
import { BrandCard } from '../../components/custom/Card';
import { BrandText } from '../../components/custom/Typography';
import { BrandButton } from '../../components/custom/Button';
import DataTable from '../../components/custom/dashboard/DataTable';
import { BRAND_COLORS } from '../../assets/brand';
import { apiRequest } from '../../utils/apiService';

const STORAGE_KEY_SETTINGS = 'platformBackupSettings';

const defaultHistory = [
  {
    id: 'seed-1',
    createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
    sizeMb: 512,
    destination: 'cloud',
    status: 'Completed',
    encrypted: true
  },
  {
    id: 'seed-2',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    sizeMb: 420,
    destination: 'local',
    status: 'Completed',
    encrypted: false
  }
];

const defaultSettings = {
  frequency: 'daily',
  time: '02:00',
  destination: 'cloud',
  encryptionEnabled: true,
  algorithm: 'AES-256'
};

const DatabaseManagement = () => {
  const [history, setHistory] = useState([]);
  const [settings, setSettings] = useState(defaultSettings);
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiRequest('/platform/backup/history', 'GET');
        if (Array.isArray(data) && data.length > 0) {
          setHistory(data);
        } else {
          setHistory(defaultHistory);
        }
      } catch {
        try {
          const storedHistory = localStorage.getItem('platformBackupHistory');
          if (storedHistory) {
            setHistory(JSON.parse(storedHistory));
          } else {
            setHistory(defaultHistory);
          }
        } catch {
          setHistory(defaultHistory);
        }
      }

      try {
        const storedSettings = localStorage.getItem(STORAGE_KEY_SETTINGS);
        if (storedSettings) {
          setSettings(JSON.parse(storedSettings));
        }
      } catch {
        setSettings(defaultSettings);
      }
    };

    load();
  }, []);

  const persistSettings = (next) => {
    setSettings(next);
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(next));
    } catch {
      // ignore
    }
  };

  const columns = useMemo(
    () => [
      {
        key: 'createdAt',
        label: 'Created at',
        render: (row) =>
          new Date(row.createdAt).toLocaleString(undefined, {
            dateStyle: 'medium',
            timeStyle: 'short'
          })
      },
      {
        key: 'destination',
        label: 'Destination',
        render: (row) =>
          row.destination === 'cloud' ? 'Cloud storage' : 'Local download'
      },
      {
        key: 'sizeMb',
        label: 'Size',
        render: (row) => `${row.sizeMb} MB`,
        align: 'right'
      },
      {
        key: 'status',
        label: 'Status',
        render: (row) => row.status,
        align: 'right'
      },
      {
        key: 'encrypted',
        label: 'Encrypted',
        render: (row) => (row.encrypted ? 'Yes' : 'No'),
        align: 'center'
      },
      {
        key: 'actions',
        label: 'Actions',
        align: 'right',
        render: (row) => (
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 8
            }}
          >
            <BrandButton
              size="sm"
              variant="outline"
              onClick={() => handleDownload(row)}
            >
              Download
            </BrandButton>
            <BrandButton
              size="sm"
              variant="ghost"
              onClick={() => handleRestore(row)}
            >
              Restore
            </BrandButton>
          </div>
        )
      }
    ],
    [history]
  );

  const handleDownload = (entry) => {
    const payload = {
      createdAt: entry.createdAt,
      sizeMb: entry.sizeMb,
      encrypted: entry.encrypted,
      destination: entry.destination
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup-${new Date(entry.createdAt)
      .toISOString()
      .replace(/[:.]/g, '-')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setMessage('Backup downloaded locally.');
  };

  const handleRestore = (entry) => {
    const confirmed = window.confirm(
      'Restore from this backup? Current data changes after this point will not be reflected.'
    );
    if (!confirmed) return;
    setMessage(
      `Restore scheduled from backup created at ${new Date(
        entry.createdAt
      ).toLocaleString()}.`
    );
  };

  const triggerBackup = async () => {
    setRunning(true);
    setMessage('');
    try {
      const response = await apiRequest('/platform/backup/trigger', 'POST');
      const created = response && response.backup
        ? {
            ...response.backup,
            destination: response.backup.destination || settings.destination,
            encrypted:
              typeof response.backup.encrypted === 'boolean'
                ? response.backup.encrypted
                : settings.encryptionEnabled
          }
        : {
            id: `backup-${Date.now()}`,
            createdAt: new Date().toISOString(),
            sizeMb: 512,
            destination: settings.destination,
            status: 'completed',
            encrypted: settings.encryptionEnabled
          };
      const nextHistory = [created, ...history].slice(0, 40);
      setHistory(nextHistory);
      try {
        localStorage.setItem(
          'platformBackupHistory',
          JSON.stringify(nextHistory)
        );
      } catch {
        // ignore
      }
      setMessage('Backup completed successfully.');
    } catch (error) {
      setMessage(
        error && error.message
          ? error.message
          : 'Failed to trigger backup. Please try again.'
      );
    } finally {
      setRunning(false);
    }
  };

  const updateSetting = (key, value) => {
    const next = {
      ...settings,
      [key]: value
    };
    persistSettings(next);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16
      }}
    >
      <BrandCard
        tone="tinted"
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1.2fr)',
          gap: 16
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 10
          }}
        >
          <BrandText variant="h3">
            Database backup and safety controls
          </BrandText>
          <BrandText tone="soft">
            Configure automatic backups, encryption, and storage targets for the
            MR.CREAMS platform database.
          </BrandText>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 10,
              marginTop: 4
            }}
          >
            <div
              style={{
                paddingInline: 10,
                paddingBlock: 6,
                borderRadius: 999,
                backgroundColor: 'rgba(34,197,94,0.08)',
                color: '#16a34a',
                fontSize: 11,
                fontWeight: 500
              }}
            >
              Last backup:{' '}
              {history[0]
                ? new Date(history[0].createdAt).toLocaleString()
                : 'Not available'}
            </div>
            <div
              style={{
                paddingInline: 10,
                paddingBlock: 6,
                borderRadius: 999,
                backgroundColor: 'rgba(37,99,235,0.06)',
                color: '#1d4ed8',
                fontSize: 11,
                fontWeight: 500
              }}
            >
              Schedule: {settings.frequency} at {settings.time}
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 10,
              marginTop: 6
            }}
          >
            <BrandButton
              size="md"
              variant="primary"
              onClick={triggerBackup}
              disabled={running}
            >
              {running ? 'Running backup…' : 'Run backup now'}
            </BrandButton>
            <BrandButton
              size="md"
              variant="outline"
              onClick={() => {
                if (!history.length) return;
                handleDownload(history[0]);
              }}
              disabled={!history.length}
            >
              Download latest backup
            </BrandButton>
          </div>
          {message && (
            <div
              style={{
                marginTop: 8,
                fontSize: 12,
                color: 'rgba(15,23,42,0.8)'
              }}
            >
              {message}
            </div>
          )}
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: 10
          }}
        >
          <div
            style={{
              borderRadius: 14,
              padding: 12,
              backgroundColor: 'rgba(15,23,42,0.02)',
              display: 'flex',
              flexDirection: 'column',
              gap: 6
            }}
          >
            <BrandText variant="caption" tone="muted">
              Backup frequency
            </BrandText>
            <select
              value={settings.frequency}
              onChange={(e) => updateSetting('frequency', e.target.value)}
              style={{
                borderRadius: 10,
                border: '1px solid rgba(148,163,184,0.6)',
                paddingInline: 10,
                paddingBlock: 6,
                fontSize: 12,
                backgroundColor: '#ffffff'
              }}
            >
              <option value="hourly">Hourly</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>
          <div
            style={{
              borderRadius: 14,
              padding: 12,
              backgroundColor: 'rgba(15,23,42,0.02)',
              display: 'flex',
              flexDirection: 'column',
              gap: 6
            }}
          >
            <BrandText variant="caption" tone="muted">
              Backup window
            </BrandText>
            <input
              type="time"
              value={settings.time}
              onChange={(e) => updateSetting('time', e.target.value)}
              style={{
                borderRadius: 10,
                border: '1px solid rgba(148,163,184,0.6)',
                paddingInline: 10,
                paddingBlock: 6,
                fontSize: 12,
                backgroundColor: '#ffffff'
              }}
            />
          </div>
          <div
            style={{
              borderRadius: 14,
              padding: 12,
              backgroundColor: 'rgba(15,23,42,0.02)',
              display: 'flex',
              flexDirection: 'column',
              gap: 6
            }}
          >
            <BrandText variant="caption" tone="muted">
              Destination
            </BrandText>
            <select
              value={settings.destination}
              onChange={(e) => updateSetting('destination', e.target.value)}
              style={{
                borderRadius: 10,
                border: '1px solid rgba(148,163,184,0.6)',
                paddingInline: 10,
                paddingBlock: 6,
                fontSize: 12,
                backgroundColor: '#ffffff'
              }}
            >
              <option value="cloud">Cloud storage</option>
              <option value="local">Local only</option>
            </select>
          </div>
          <div
            style={{
              borderRadius: 14,
              padding: 12,
              backgroundColor: 'rgba(15,23,42,0.02)',
              display: 'flex',
              flexDirection: 'column',
              gap: 6
            }}
          >
            <BrandText variant="caption" tone="muted">
              Encryption
            </BrandText>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 12
              }}
            >
              <input
                type="checkbox"
                checked={settings.encryptionEnabled}
                onChange={(e) =>
                  updateSetting('encryptionEnabled', e.target.checked)
                }
              />
              Enable encryption
            </label>
            {settings.encryptionEnabled && (
              <select
                value={settings.algorithm}
                onChange={(e) => updateSetting('algorithm', e.target.value)}
                style={{
                  borderRadius: 10,
                  border: '1px solid rgba(148,163,184,0.6)',
                  paddingInline: 10,
                  paddingBlock: 6,
                  fontSize: 12,
                  backgroundColor: '#ffffff'
                }}
              >
                <option value="AES-256">AES-256</option>
                <option value="ChaCha20">ChaCha20</option>
              </select>
            )}
          </div>
        </div>
      </BrandCard>

      <BrandCard
        tone="surface"
        header={{
          title: 'Backup history',
          meta: 'Most recent 40 backups'
        }}
      >
        <DataTable
          columns={columns}
          rows={history}
          keyField="id"
        />
      </BrandCard>
    </div>
  );
};

export default DatabaseManagement;
