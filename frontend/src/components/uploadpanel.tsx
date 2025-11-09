import React, { useState, useRef } from 'react';
import { Upload, Button, List, Alert, Spin, Empty, Card, Row, Col, Space, Progress } from 'antd';
import { InboxOutlined, DeleteOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';

// Type Definitions
interface UploadPanelProps {
  currentUser: string;
}

interface UploadedFile {
  name: string;
  size: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  percent?: number;
}

// Constants
const API_BASE: string = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const UploadPanel: React.FC<UploadPanelProps> = ({ currentUser }) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState<boolean>(false);

  const handleFileSelect = (info: { file: UploadFile; fileList: UploadFile[] }): void => {
    const files: File[] = info.fileList
      .map(f => f.originFileObj as unknown as File)
      .filter((f): f is File => f !== undefined && f !== null);
    
    setSelectedFiles(files);
    setUploadedFiles([]);
  };

  const handleUpload = async (): Promise<void> => {
    if (selectedFiles.length === 0) {
      alert('Please select files to upload');
      return;
    }

    setUploading(true);
    const initialStatus: UploadedFile[] = selectedFiles.map((file: File) => ({
      name: file.name,
      size: file.size,
      status: 'pending' as const,
      percent: 0
    }));
    setUploadedFiles(initialStatus);

    try {
      if (selectedFiles.length === 1) {
        await uploadSingleFile(selectedFiles[0]);
      } else {
        await uploadMultipleFiles(selectedFiles);
      }
      
      alert('Document(s) uploaded successfully!');
      
      setTimeout(() => {
        setSelectedFiles([]);
        setUploadedFiles([]);
      }, 2000);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setUploadedFiles(prev => prev.map(f => ({ 
        ...f, 
        status: 'error' as const,
        error: errorMessage
      })));
    } finally {
      setUploading(false);
    }
  };

  const uploadSingleFile = async (file: File): Promise<void> => {
    const formData = new FormData();
    formData.append('pdf', file);
    
    setUploadedFiles(prev => [{
      ...prev[0],
      status: 'uploading' as const,
      percent: 50
    }]);

    const response = await fetch(`${API_BASE}/documents/upload`, {
      method: 'POST',
      headers: { 'x-user-id': currentUser },
      body: formData
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Upload failed');
    }
    
    setUploadedFiles(prev => [{
      ...prev[0],
      status: 'success' as const,
      percent: 100
    }]);
  };

  const uploadMultipleFiles = async (files: File[]): Promise<void> => {
    const formData = new FormData();
    files.forEach((file: File) => formData.append('pdfs', file));
    
    setUploadedFiles(prev => prev.map(f => ({ ...f, status: 'uploading' as const, percent: 50 })));

    const response = await fetch(`${API_BASE}/documents/upload-multiple`, {
      method: 'POST',
      headers: { 'x-user-id': currentUser },
      body: formData
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Bulk upload failed');
    }
    
    setUploadedFiles(prev => prev.map(f => ({ ...f, status: 'success' as const, percent: 100 })));
  };

  const removeFile = (index: number): void => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes: string[] = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <Card>
        <h2 style={{ marginBottom: '8px' }}>Upload Documents</h2>
        <p style={{ color: '#666', marginBottom: '24px' }}>Only PDF files are supported.</p>

        <Spin spinning={uploading}>
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Upload.Dragger
                multiple
                maxCount={10}
                accept=".pdf"
                beforeUpload={() => false}
                onChange={handleFileSelect}
              >
                <p style={{ fontSize: '48px' }}>
                  <InboxOutlined />
                </p>
                <p style={{ fontSize: '16px' }}>Click or drag PDF files to upload</p>
                <p style={{ color: '#999' }}>Supported format: PDF</p>
              </Upload.Dragger>
            </Col>
            {selectedFiles.length > 0 && (
              <Col span={24}>
                <Alert
                  message={`${selectedFiles.length} file(s) selected`}
                  type="info"
                  style={{ marginBottom: '16px' }}
                />
                <List
                  dataSource={selectedFiles}
                  renderItem={(file, idx) => (
                    <List.Item
                      actions={[
                        <Button
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => removeFile(idx)}
                        >
                          Remove
                        </Button>
                      ]}
                    >
                      <List.Item.Meta
                        title={file.name}
                        description={formatFileSize(file.size)}
                      />
                    </List.Item>
                  )}
                />
              </Col>
            )}
            {uploadedFiles.length > 0 && (
              <Col span={24}>
                <List
                  dataSource={uploadedFiles}
                  renderItem={(file) => (
                    <List.Item>
                      <List.Item.Meta
                        title={file.name}
                        description={
                          file.status === 'success' ? (
                            <span style={{ color: '#52c41a' }}>Upload completed</span>
                          ) : file.status === 'error' ? (
                            <span style={{ color: '#ff4d4f' }}>{file.error}</span>
                          ) : (
                            <Progress percent={file.percent || 0} />
                          )
                        }
                      />
                    </List.Item>
                  )}
                />
              </Col>
            )}
            <Col span={24}>
              <Button
              style={{marginTop:'23px'}}
                type="primary"
                size="large"
                block
                onClick={handleUpload}
                disabled={uploading || selectedFiles.length === 0}
                loading={uploading}
              >
                Upload {selectedFiles.length > 0 ? `${selectedFiles.length} File(s)` : 'Files'}
              </Button>
            </Col>

            {/* Info */}
            <Col span={24}>
              <Alert
                message="Info"
                description="You can upload single or multiple PDF files at once. Files up to 50MB are supported."
                type="info"
              />
            </Col>
          </Row>
        </Spin>
      </Card>
    </div>
  );
};

export default UploadPanel;