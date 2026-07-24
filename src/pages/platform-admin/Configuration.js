import React, { useState, useEffect } from 'react';
import { BrandCard } from '../../components/custom/Card';
import { BrandText } from '../../components/custom/Typography';
import { BrandButton } from '../../components/custom/Button';
import { LoadingState, NotificationBanner } from '../../components/custom/CustomUI';
import { apiRequest } from '../../utils/apiService';
import PaymentGatewayConfig from '../../components/admin/PaymentGatewayConfig';

const Configuration = () => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ open: false, text: '', severity: 'success' });
  const [groups, setGroups] = useState({ core: [], security: [], features: [] });

  useEffect(() => {
    fetchConfig();
  }, []);

  useEffect(() => {
    if (!message.open) return;
    const timer = setTimeout(
      () => setMessage((prev) => ({ ...prev, open: false })),
      6000
    );
    return () => clearTimeout(timer);
  }, [message.open]);

  const fetchConfig = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const data = await apiRequest('/platform/config', 'GET', null, token);
      setConfig(data);
      const entries = Object.entries(data.allFlags || {});
      setGroups({
        core: entries.filter(([k]) => k.includes('core') || k.includes('maintenance')),
        security: entries.filter(([k]) => k.includes('security') || k.includes('audit')),
        features: entries.filter(([k]) => !k.includes('core') && !k.includes('security'))
      });
    } catch (error) {
      console.error('Failed to fetch config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (section, key) => {
    setConfig(prev => {
      // Handle updates to allFlags (the source of truth)
      if (section === 'allFlags') {
        return {
          ...prev,
          allFlags: {
            ...prev.allFlags,
            [key]: {
              ...prev.allFlags[key],
              enabled: !prev.allFlags[key].enabled
            }
          },
          // Also update the convenience fields if they map
          ...(key === 'maintenance_mode' ? { maintenanceMode: !prev.maintenanceMode } : {}),
          featureFlags: {
            ...prev.featureFlags,
            ...(key === 'beta_features' ? { betaFeatures: !prev.featureFlags.betaFeatures } : {}),
            ...(key === 'new_analytics' ? { newAnalytics: !prev.featureFlags.newAnalytics } : {})
          }
        };
      }
      
      // Legacy handling (if needed, but ideally we drive everything from allFlags)
      if (section) {
        return {
          ...prev,
          [section]: {
            ...prev[section],
            [key]: !prev[section][key]
          }
        };
      } else {
        return {
          ...prev,
          [key]: !prev[key]
        };
      }
    });
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('authToken');
      
      // Prepare dynamic flags payload
      const dynamicFlags = {};
      if (config.allFlags) {
        Object.entries(config.allFlags).forEach(([key, value]) => {
          dynamicFlags[key] = value.enabled;
        });
      }

      await apiRequest('/platform/config', 'POST', {
        featureFlags: config.featureFlags,
        maintenanceMode: config.maintenanceMode,
        dynamicFlags
      }, token);
      setMessage({ open: true, text: 'Configuration saved successfully', severity: 'success' });
    } catch (error) {
      setMessage({ open: true, text: 'Failed to save configuration', severity: 'error' });
    }
  };

  if (loading) return <LoadingState label="Loading configuration" />;

  const bannerTone =
    message.severity === 'error'
      ? 'coral'
      : message.severity === 'warning'
      ? 'blue'
      : 'teal';

  const renderToggle = (checked, onChange) => (
    <label
      style={{
        position: 'relative',
        width: 40,
        height: 22,
        display: 'inline-flex',
        alignItems: 'center',
        cursor: 'pointer'
      }}
    >
      <span
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 999,
          backgroundColor: checked ? 'rgba(34,197,94,0.35)' : 'rgba(148,163,184,0.45)',
          transition: 'background-color 150ms ease-out'
        }}
      />
      <span
        style={{
          position: 'relative',
          left: checked ? 18 : 4,
          width: 14,
          height: 14,
          borderRadius: 999,
          backgroundColor: '#ffffff',
          boxShadow: '0 1px 2px rgba(15,23,42,0.4)',
          transition: 'left 150ms ease-out'
        }}
      />
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0,
          margin: 0
        }}
      />
    </label>
  );

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16
      }}
    >
      <BrandText variant="h2">System configuration</BrandText>

      {message.open && message.text && (
        <NotificationBanner tone={bannerTone} title={message.severity} message={message.text} />
      )}

      <BrandCard
        tone="surface"
        header={{
          title: 'General settings'
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12
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
              <BrandText>Maintenance mode</BrandText>
              <BrandText variant="caption" tone="muted">
                Prevents regular users from accessing the system
              </BrandText>
            </div>
            {renderToggle(
              config?.allFlags?.maintenance_mode?.enabled || false,
              () => handleToggle('allFlags', 'maintenance_mode')
            )}
          </div>

          <div
            style={{
              height: 1,
              backgroundColor: 'rgba(226,232,240,0.9)'
            }}
          />

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12
            }}
          >
            <div>
              <BrandText>Allow registration</BrandText>
              <BrandText variant="caption" tone="muted">
                Enable or disable new user signups
              </BrandText>
            </div>
            {renderToggle(
              config?.allowRegistration || false,
              () => handleToggle(null, 'allowRegistration')
            )}
          </div>
        </div>
      </BrandCard>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 16
        }}
      >
        <BrandCard
          tone="surface"
          header={{
            title: 'Core'
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8
            }}
          >
            {groups.core.map(([key, flag]) => (
              <div
                key={key}
                style={{
                  paddingInline: 4,
                  paddingBlock: 6,
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 10
                }}
              >
                <div>
                  <BrandText
                    variant="body"
                    style={{
                      fontSize: 13
                    }}
                  >
                    {flag.description || key}
                  </BrandText>
                  <BrandText variant="caption" tone="muted">
                    Key: {key}
                  </BrandText>
                </div>
                {renderToggle(
                  flag.enabled,
                  () => handleToggle('allFlags', key)
                )}
              </div>
            ))}
          </div>
        </BrandCard>

        <BrandCard
          tone="surface"
          header={{
            title: 'Security'
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8
            }}
          >
            {groups.security.map(([key, flag]) => (
              <div
                key={key}
                style={{
                  paddingInline: 4,
                  paddingBlock: 6,
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 10
                }}
              >
                <div>
                  <BrandText
                    variant="body"
                    style={{
                      fontSize: 13
                    }}
                  >
                    {flag.description || key}
                  </BrandText>
                  <BrandText variant="caption" tone="muted">
                    Key: {key}
                  </BrandText>
                </div>
                {renderToggle(
                  flag.enabled,
                  () => handleToggle('allFlags', key)
                )}
              </div>
            ))}
          </div>
        </BrandCard>

        <BrandCard
          tone="surface"
          header={{
            title: 'Features'
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8
            }}
          >
            {groups.features.map(([key, flag]) => (
              <div
                key={key}
                style={{
                  paddingInline: 4,
                  paddingBlock: 6,
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 10
                }}
              >
                <div>
                  <BrandText
                    variant="body"
                    style={{
                      fontSize: 13
                    }}
                  >
                    {flag.description || key}
                  </BrandText>
                  <BrandText variant="caption" tone="muted">
                    Key: {key}
                  </BrandText>
                </div>
                {renderToggle(
                  flag.enabled,
                  () => handleToggle('allFlags', key)
                )}
              </div>
            ))}
          </div>
        </BrandCard>
      </div>

      <BrandCard
        tone="surface"
        header={{
          title: 'Payment gateways',
          meta: 'Stripe, Chapa, SantimPay'
        }}
      >
        <BrandText
          variant="caption"
          tone="muted"
          style={{
            marginBottom: 8
          }}
        >
          Configure credentials for Stripe (international) and Ethiopian gateways (Chapa, SantimPay).
        </BrandText>
        <PaymentGatewayConfig />
      </BrandCard>

      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 8
        }}
      >
        <BrandButton size="md" onClick={handleSave}>
          Save changes
        </BrandButton>
        <BrandButton
          size="md"
          variant="outline"
          onClick={() =>
            setMessage({
              open: true,
              text: 'Rollback scheduled',
              severity: 'warning'
            })
          }
        >
          Rollback
        </BrandButton>
      </div>
    </div>
  );
};

export default Configuration;
