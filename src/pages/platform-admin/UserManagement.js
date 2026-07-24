import React, { useEffect, useState } from 'react';
import { BrandCard } from '../../components/custom/Card';
import { BrandText } from '../../components/custom/Typography';
import { BrandButton } from '../../components/custom/Button';
import DataTable from '../../components/custom/dashboard/DataTable';
import { ModalOverlay } from '../../components/custom/CustomUI';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('all');
  const [userType, setUserType] = useState('all');
  const [pagination, setPagination] = useState({ total: 0 });
  const [selectedUser, setSelectedUser] = useState(null);
  const [detail, setDetail] = useState(null);

  const fetchUsers = async () => {
    const token = localStorage.getItem('authToken');
    const offset = page * rowsPerPage;
    const res = await fetch(`/api/platform/users?limit=${rowsPerPage}&offset=${offset}&q=${encodeURIComponent(q)}&status=${status}&userType=${userType}`, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setUsers(data.users || []);
    setPagination(data.pagination || { total: 0 });
  };

  const fetchDetail = async (id) => {
    const token = localStorage.getItem('authToken');
    const res = await fetch(`/api/platform/users/${id}`, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setDetail(data);
  };

  useEffect(() => { fetchUsers(); }, [page, rowsPerPage, q, status, userType]);

  const bulkAction = async (action) => {
    const ids = users.slice(0, Math.min(10, users.length)).map(u => u.id);
    const token = localStorage.getItem('authToken');
    await fetch('/api/platform/users/bulk-actions', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ action, userIds: ids }) });
    fetchUsers();
  };

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <span
          style={{
            fontSize: 11,
            paddingInline: 8,
            paddingBlock: 3,
            borderRadius: 999,
            backgroundColor: row.is_active ? 'rgba(22,163,74,0.16)' : 'rgba(148,163,184,0.16)',
            color: row.is_active ? '#166534' : 'rgba(15,23,42,0.7)'
          }}
        >
          {row.is_active ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      key: 'created_at',
      label: 'Join date',
      render: (row) => new Date(row.created_at).toLocaleDateString()
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <BrandButton
          size="sm"
          variant="outline"
          onClick={() => {
            setSelectedUser(row);
            fetchDetail(row.id);
          }}
        >
          View
        </BrandButton>
      )
    }
  ];

  const totalPages =
    rowsPerPage > 0 ? Math.max(1, Math.ceil((pagination.total || 0) / rowsPerPage)) : 1;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16
      }}
    >
      <BrandText variant="h2">Users</BrandText>

      <BrandCard
        tone="surface"
        header={{
          title: 'Filters and actions'
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
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
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name or email"
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
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
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
              User type
            </label>
            <select
              value={userType}
              onChange={(e) => setUserType(e.target.value)}
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
              <option value="individual">Individual</option>
              <option value="therapist">Therapist</option>
              <option value="platform_admin">Platform admin</option>
            </select>
          </div>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 8,
              justifyContent: 'flex-end'
            }}
          >
            <BrandButton
              size="sm"
              variant="outline"
              onClick={() => bulkAction('activate')}
            >
              Activate
            </BrandButton>
            <BrandButton
              size="sm"
              variant="outline"
              onClick={() => bulkAction('deactivate')}
            >
              Deactivate
            </BrandButton>
            <BrandButton
              size="sm"
              onClick={() => {
                const header = ['id', 'name', 'email', 'user_type', 'is_active', 'created_at'];
                const rows = users.map((u) => [
                  u.id,
                  u.name,
                  u.email,
                  u.user_type,
                  u.is_active,
                  u.created_at
                ]);
                const csv = [header, ...rows]
                  .map((r) => r.map((v) => `"${String(v || '')}"`).join(','))
                  .join('\n');
                const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'users.csv';
                a.click();
                URL.revokeObjectURL(url);
              }}
            >
              Export
            </BrandButton>
          </div>
        </div>
      </BrandCard>

      <BrandCard
        tone="surface"
        header={{
          title: 'Users table',
          meta: `Total: ${pagination.total || 0}`
        }}
      >
        <DataTable columns={columns} rows={users} keyField="id" />
        <div
          style={{
            marginTop: 10,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12,
            fontSize: 12,
            color: 'rgba(100,116,139,0.95)'
          }}
        >
          <div>
            Page {page + 1} of {totalPages}
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            <span>Rows per page:</span>
            <select
              value={rowsPerPage}
              onChange={(e) => {
                const value = parseInt(e.target.value, 10);
                setRowsPerPage(value);
                setPage(0);
              }}
              style={{
                paddingInline: 8,
                paddingBlock: 4,
                borderRadius: 8,
                border: '1px solid rgba(148,163,184,0.7)',
                backgroundColor: '#ffffff'
              }}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <BrandButton
              size="sm"
              variant="outline"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              Previous
            </BrandButton>
            <BrandButton
              size="sm"
              variant="outline"
              onClick={() =>
                setPage((p) =>
                  p + 1 < totalPages ? p + 1 : p
                )
              }
              disabled={page + 1 >= totalPages}
            >
              Next
            </BrandButton>
          </div>
        </div>
      </BrandCard>

      <ModalOverlay
        open={!!selectedUser}
        title="User details"
        onClose={() => {
          setSelectedUser(null);
          setDetail(null);
        }}
      >
        {detail && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              fontSize: 13
            }}
          >
            <BrandText variant="h3">
              {detail.user.name} ({detail.user.email})
            </BrandText>
            <BrandText variant="body">
              Conflicts: {detail.conflicts.length}
            </BrandText>
            <BrandText variant="body">
              Recent activity logs: {detail.activityLogs.length}
            </BrandText>
          </div>
        )}
      </ModalOverlay>
    </div>
  );
};

export default UserManagement;
