import React from 'react';
import { Dropdown, Button, Space, Tag } from 'antd';
import { UserOutlined, DownOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';

// Type Definitions
interface UserRole {
  name: string;
  role: 'admin' | 'default' | 'readonly';
  permissions: string[];
}

interface UserRoles {
  [key: string]: UserRole;
}

interface UserSwitcherProps {
  currentUser: string | null;
  onUserChange: (userId: string) => void;
}

// Constants
const USERS: UserRoles = {
  A1: { name: 'Admin (A1)', role: 'admin', permissions: ['upload', 'view', 'annotate'] },
  D1: { name: 'Default User 1 (D1)', role: 'default', permissions: ['view', 'annotate'] },
  D2: { name: 'Default User 2 (D2)', role: 'default', permissions: ['view', 'annotate'] },
  R1: { name: 'Read-only (R1)', role: 'readonly', permissions: ['view'] }
};

const UserSwitcher: React.FC<UserSwitcherProps> = ({ currentUser, onUserChange }) => {
  const handleUserSelect = (userId: string): void => {
    onUserChange(userId);
  };

  const items: MenuProps['items'] = Object.entries(USERS).map(([key, user]) => ({
    key: key,
    label: (
      <Space direction="vertical" size={0}>
        <span>{user.name}</span>
        <span style={{ fontSize: '12px', color: '#999' }}>Role: {user.role}</span>
      </Space>
    ),
    onClick: () => handleUserSelect(key)
  }));

  return (
    <Dropdown
      menu={{ items }}
      trigger={['click']}
    >
      <Button icon={<UserOutlined />}>
        Switch User <DownOutlined />
      </Button>
    </Dropdown>
  );
};

export default UserSwitcher;