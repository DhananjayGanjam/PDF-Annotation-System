import React, { useState, useEffect } from 'react';
import { Table, Input, Button, Card, Row, Col, Space, Alert, Spin, Empty, Tag, Modal, message } from 'antd';
import { ReloadOutlined, DownloadOutlined, EyeOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';


interface Document {
  _id: string;
  name: string;
  filename: string;
  filepath: string;
  uploader: string;
  size: number;
  uploadDate: string;
}

interface UserRole {
  name: string;
  role: 'admin' | 'default' | 'readonly';
  permissions: string[];
}

interface DocumentListProps {
  currentUser: string;
  userInfo: UserRole;
  onViewDocument: (doc: Document) => void;
}


const API_BASE: string = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const DocumentList: React.FC<DocumentListProps> = ({ currentUser, userInfo, onViewDocument }) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const canAnnotate: boolean = userInfo.permissions.includes('annotate');
  const canUpload: boolean = userInfo.permissions.includes('upload');

  useEffect(() => {
    fetchDocuments();
  }, [currentUser]);

  const fetchDocuments = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE}/documents`, {
        headers: { 'x-user-id': currentUser }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch documents: ${response.statusText}`);
      }
      
      const data: Document[] = await response.json();
      setDocuments(data);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Error fetching documents:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    } as Intl.DateTimeFormatOptions);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes: string[] = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const handleViewDocument = (doc: Document): void => {
    if (onViewDocument) {
      onViewDocument(doc);
    }
  };

  const handleDownloadDocument = async (doc: Document): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE}/documents/${doc._id}/download`, {
        headers: { 'x-user-id': currentUser.toUpperCase() }
      });
      
      if (!response.ok) {
        throw new Error('Download failed');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = doc.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      message.success('Document downloaded successfully');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      message.error('Error downloading document: ' + errorMessage);
    }
  };

  const handleDeleteDocument = (doc: Document): void => {
    Modal.confirm({
      title: 'Delete Document',
      content: `Are you sure you want to delete "${doc.name}"? This action cannot be undone.`,
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        await performDelete(doc._id);
      }
    });
  };

  const performDelete = async (docId: string): Promise<void> => {
    try {
      setDeletingId(docId);
      const response = await fetch(`${API_BASE}/documents/${docId}`, {
        method: 'DELETE',
        headers: { 'x-user-id': currentUser.toUpperCase() }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete document');
      }
      
      setDocuments(documents.filter(doc => doc._id !== docId));
      message.success('Document deleted successfully');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      message.error('Error deleting document: ' + errorMessage);
    } finally {
      setDeletingId(null);
    }
  };

  const filteredDocuments = documents.filter((doc: Document) =>
    doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.uploader.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns: ColumnsType<Document> = [
    {
      title: 'Document Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <span>{text}</span>
    },
    {
      title: 'Uploaded By',
      dataIndex: 'uploader',
      key: 'uploader',
      render: (text: string) => <Tag>{text}</Tag>
    },
    {
      title: 'Upload Date',
      dataIndex: 'uploadDate',
      key: 'uploadDate',
      render: (text: string) => formatDate(text)
    },
    {
      title: 'Size',
      dataIndex: 'size',
      key: 'size',
      render: (size: number) => formatFileSize(size)
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record: Document) => (
        <Space>
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => handleViewDocument(record)}
            size="small"
          >
            {canAnnotate ? 'View & Annotate' : 'View'}
          </Button>
          <Button
            icon={<DownloadOutlined />}
            onClick={() => handleDownloadDocument(record)}
            size="small"
          >
            Download
          </Button>
          {canUpload && (
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteDocument(record)}
              size="small"
              loading={deletingId === record._id}
            >
              Delete
            </Button>
          )}
        </Space>
      )
    }
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'white',marginLeft:'100px' }}>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card>
            <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
              <Col span={24}>
                <h2 style={{ marginBottom: '8px' }}>Documents</h2>
                <p style={{ color: '#666'}}>
                  Viewing as: <span style={{ color: 'black' }}>{userInfo.name}</span>
                </p>
              </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
              <Col span={24}>
                <Alert
                  message={`Permissions: ${userInfo.permissions.join(', ')}`}
                  type="info"
                  showIcon
                />
              </Col>
            </Row>

            {error && (
              <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
                <Col span={24}>
                  <Alert
                    message="Error loading documents"
                    description={error}
                    type="error"
                    showIcon
                    action={
                      <Button size="small" danger onClick={fetchDocuments}>
                        Try Again
                      </Button>
                    }
                  />
                </Col>
              </Row>
            )}

            <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
              <Col span={24}>
                <Input
                  placeholder="Search documents by name or uploader..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  allowClear
                />
              </Col>
            </Row>

            <Spin spinning={loading}>
              {loading ? (
                <Empty description="Loading documents..." />
              ) : documents.length === 0 ? (
                <Empty
                  description={userInfo.permissions.includes('upload') ? 'No documents found. Try uploading one.' : 'No documents available'}
                />
              ) : filteredDocuments.length === 0 ? (
                <Empty description="No documents match your search" />
              ) : (
                <>
                  <Table
                    columns={columns}
                    dataSource={filteredDocuments}
                    rowKey="_id"
                    pagination={{
                      pageSize: 10,
                      total: filteredDocuments.length,
                      showTotal: (total, range) =>
                        `${range[0]}-${range[1]} of ${total} documents`
                    }}
                    bordered
                  />
                </>
              )}
            </Spin>

            <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
              <Col span={24} style={{ textAlign: 'center' }}>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={fetchDocuments}
                  loading={loading}
                >
                  Refresh
                </Button>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DocumentList;