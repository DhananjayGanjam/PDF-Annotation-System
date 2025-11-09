import React, { useState, useEffect } from 'react';
import { Layout, Button, Input, List, Form, Select, Checkbox, Space, Divider, Empty, Spin, Alert, Row, Col } from 'antd';

const { Content } = Layout;

// Type Definitions
interface Position {
  x: number;
  y: number;
}

interface Annotation {
  _id: string;
  documentId: string;
  createdBy: string;
  text: string;
  page: number;
  position: Position;
  visibility: 'everyone' | 'specific';
  visibleTo: string[];
  createdAt: string;
  updatedAt: string;
}

interface Document {
  _id: string;
  name: string;
  filename: string;
  filepath: string;
  uploader: string;
  size: number;
  uploadDate: string;
}

interface PDFViewerProps {
  document: Document;
  currentUser: string;
  onBack: () => void;
  canAnnotate: boolean;
}
const API_BASE: string = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const BACKEND_URL: string = API_BASE.replace('/api', '');
const allUsers = ['A1', 'D1', 'D2', 'R1'];

const PDFViewer: React.FC<PDFViewerProps> = ({ document, currentUser, onBack, canAnnotate }) => {
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [form] = Form.useForm();
  const [newAnnotation, setNewAnnotation] = useState<string>('');
  const [visibilityMode, setVisibilityMode] = useState<'everyone' | 'specific'>('everyone');
  const [selectedUsers, setSelectedUsers] = useState<string[]>(['A1', 'D1', 'D2', 'R1']);
  const [clickPosition, setClickPosition] = useState<{ x: number; y: number } | null>(null);
  const [currentPage] = useState<number>(1);
  const [selectedAnnotation, setSelectedAnnotation] = useState<string | null>(null);

  useEffect(() => {
    fetchAnnotations();
    setLoading(false);
  }, [document._id]);

  const fetchAnnotations = async (): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE}/annotations/document/${document._id}`, {
        headers: { 'x-user-id': currentUser.toUpperCase() }
      });
      
      if (!response.ok) throw new Error('Failed to fetch annotations');
      const data: Annotation[] = await response.json();
      setAnnotations(data);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error fetching annotations:', errorMessage);
      setError(errorMessage);
    }
  };

  const handlePDFClick = (e: React.MouseEvent<HTMLDivElement>): void => {
    if (!canAnnotate || !showForm) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setClickPosition({ x: Math.round(x * 100) / 100, y: Math.round(y * 100) / 100 });
  };

  const handleAddAnnotation = async (): Promise<void> => {
    if (!newAnnotation.trim()) {
      alert('Please enter annotation text');
      return;
    }

    const payload = {
      documentId: document._id,
      text: newAnnotation,
      page: currentPage,
      position: clickPosition || { x: Math.random() * 80 + 10, y: Math.random() * 80 + 10 },
      visibility: visibilityMode,
      visibleTo: visibilityMode === 'specific' ? selectedUsers : allUsers
    };

    try {
      const response = await fetch(`${API_BASE}/annotations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.toUpperCase()
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to create annotation');
      }

      setAnnotations([...annotations, data]);
      setNewAnnotation('');
      setShowForm(false);
      setClickPosition(null);
      form.resetFields();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert('Error creating annotation: ' + errorMessage);
    }
  };

  const handleDeleteAnnotation = async (annotationId: string): Promise<void> => {
    if (!window.confirm('Delete this annotation?')) return;

    try {
      const response = await fetch(`${API_BASE}/annotations/${annotationId}`, {
        method: 'DELETE',
        headers: { 'x-user-id': currentUser }
      });

      if (!response.ok) throw new Error('Failed to delete annotation');
      setAnnotations(annotations.filter(a => a._id !== annotationId));
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert('Error deleting annotation: ' + errorMessage);
    }
  };

  const currentPageAnnotations = annotations.filter(a => a.page === currentPage);

  return (
    <Layout style={{ minHeight: '100vh',marginLeft:'300px',width:'850px' }}>
      <Content style={{display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
        <div style={{ marginBottom: '16px', alignSelf: 'flex-start'}}>
          <Button onClick={onBack}>
             Back
          </Button>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '20px'}}>
          <h1 style={{fontSize:'33px'}}>{document.name}</h1>
        </div>

        {error && (
          <Alert message="Error" description={error} type="error" style={{ marginBottom: '24px' }} />
        )}

        {loading ? (
          <Spin size="large" />
        ) : (
          <Row gutter={[24, 24]} style={{ width: '100%', maxWidth: '1300px' }}>
            <Col xs={24} lg={16}>
              <div 
                onClick={handlePDFClick}
                style={{ 
                  padding: '24px', 
                  backgroundColor: '#fff',
                  cursor: canAnnotate && showForm ? 'crosshair' : 'default',
                  position: 'relative',
                  height: '600px',
                  overflow: 'hidden'
                }}
              >
                <iframe
                  src={`${BACKEND_URL}/${document.filepath}#toolbar=0`}
                  style={{ width: '100%', height: '100%', pointerEvents: canAnnotate && showForm ? 'none' : 'auto' }}
                  title="PDF Viewer"
                />

                {currentPageAnnotations.map((annotation) => (
                  <div
                    key={annotation._id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedAnnotation(annotation._id);
                    }}
                    style={{
                      position: 'absolute',
                      left: `${annotation.position.x}%`,
                      top: `${annotation.position.y}%`,
                      width: '20px',
                      height: '20px',
                      backgroundColor: selectedAnnotation === annotation._id ? '#ff4d4f' : '#1890ff',
                      borderRadius: '50%',
                      border: selectedAnnotation === annotation._id ? '3px solid #fff' : '2px solid #fff',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                      transform: 'translate(-50%, -50%)',
                      transition: 'all 0.3s ease',
                      zIndex: 10
                    }}
                    title={`${annotation.createdBy}: ${annotation.text}`}
                  />
                ))}

                {canAnnotate && showForm && clickPosition && (
                  <div style={{ padding: '8px', backgroundColor: '#e6f7ff', color: '#0050b3', fontSize: '12px', marginTop: '8px', position: 'absolute', bottom: '10px', left: '10px', zIndex: 11 }}>
                    Position: X: {clickPosition.x.toFixed(2)}%, Y: {clickPosition.y.toFixed(2)}%
                  </div>
                )}
              </div>
            </Col>

            <Col xs={24} lg={8}>
              <div style={{ backgroundColor: '#fafafa',  maxHeight: '600px', overflowY: 'auto' }}>
                <h3>Annotations ({annotations.length})</h3>
                {canAnnotate && (
                  <>
                    <Button
                      type={showForm ? 'default' : 'primary'}
                      block
                      onClick={() => setShowForm(!showForm)}
                      style={{ marginBottom: '16px' }}
                    >
                      {showForm ? 'Cancel' : 'Add Annotation'}
                    </Button>

                    {showForm && (
                      <>
                        <Form form={form} layout="vertical" style={{ marginBottom: '16px' }}>
                          <Form.Item label="Annotation Text">
                            <Input.TextArea
                              value={newAnnotation}
                              onChange={(e) => setNewAnnotation(e.target.value)}
                              rows={3}
                              placeholder="Enter your annotation..."
                            />
                          </Form.Item>

                          <Form.Item label="Visibility">
                            <Select value={visibilityMode} onChange={setVisibilityMode}>
                              <Select.Option value="everyone">Everyone</Select.Option>
                              <Select.Option value="specific">Specific Users</Select.Option>
                            </Select>
                          </Form.Item>

                          {visibilityMode === 'specific' && (
                            <Form.Item label="Select Users">
                              <Checkbox.Group
                                value={selectedUsers}
                                onChange={(checkedValues) => setSelectedUsers(checkedValues as string[])}
                                options={allUsers.map(u => ({ label: u, value: u }))}
                              />
                            </Form.Item>
                          )}

                          <Space style={{ width: '100%' }}>
                            <Button type="primary" onClick={handleAddAnnotation} block>
                              Save
                            </Button>
                            <Button onClick={() => { setShowForm(false); setNewAnnotation(''); }} block>
                              Cancel
                            </Button>
                          </Space>
                        </Form>
                        <Divider />
                      </>
                    )}
                  </>
                )}

                {annotations.length === 0 ? (
                  <Empty description="No annotations yet" />
                ) : (
                  <List
                    dataSource={annotations}
                    renderItem={(annotation) => (
                      <List.Item
                        style={{
                          backgroundColor: selectedAnnotation === annotation._id ? '#e6f7ff' : 'transparent',
                          padding: '8px',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                        onClick={() => setSelectedAnnotation(annotation._id)}
                        actions={
                          canAnnotate && annotation.createdBy === currentUser.toUpperCase()
                            ? [
                                <Button type="text" size="small" style={{background:'red'}} onClick={() => handleDeleteAnnotation(annotation._id)}>
                                  Delete
                                </Button>
                              ]
                            : []
                        }
                      >
                        <List.Item.Meta
                          title={`${annotation.createdBy}`}
                          description={annotation.text}
                        />
                      </List.Item>
                    )}
                  />
                )}
              </div>
            </Col>
          </Row>
        )}
      </Content>
    </Layout>
  );
};

export default PDFViewer;