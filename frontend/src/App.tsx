import { useState } from 'react';
import { Layout, Button, Row, Col, Card, Space } from 'antd';
import { LogoutOutlined } from '@ant-design/icons';
import UploadPanel from './components/uploadpanel';
import DocumentList from './components/documentlist';
import UserSwitcher from './components/userswitcher';
import PDFViewer from './components/PDFViewer';

const { Header, Content } = Layout;


interface UserRole {
  name: string;
  role: 'admin' | 'default' | 'readonly';
  permissions: string[];
}

interface UserRoles {
  [key: string]: UserRole;
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

const USERS: UserRoles = {
  A1: { name: 'Admin (A1)', role: 'admin', permissions: ['upload', 'view', 'annotate'] },
  D1: { name: 'Default User 1 (D1)', role: 'default', permissions: ['view', 'annotate'] },
  D2: { name: 'Default User 2 (D2)', role: 'default', permissions: ['view', 'annotate'] },
  R1: { name: 'Read-only (R1)', role: 'readonly', permissions: ['view'] }
};

type PageView = 'roleSelection' | 'documentList' | 'uploadPanel' | 'pdfViewer';

function App() {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<PageView>('roleSelection');
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

  const userInfo: UserRole | undefined = currentUser ? USERS[currentUser] : undefined;
  const canUpload: boolean = userInfo ? userInfo.permissions.includes('upload') : false;
  const canAnnotate: boolean = userInfo ? userInfo.permissions.includes('annotate') : false;

  const handleRoleSelect = (userId: string): void => {
    setCurrentUser(userId);
    setCurrentPage('documentList');
  };

  const handleUserChange = (userId: string): void => {
    setCurrentUser(userId);
    setCurrentPage('documentList');
  };

  const handleLogout = (): void => {
    setCurrentUser(null);
    setCurrentPage('roleSelection');
  };

  const handleOpenUpload = (): void => {
    setCurrentPage('uploadPanel');
  };

  const handleBackToDocuments = (): void => {
    setCurrentPage('documentList');
  };

  const handleViewDocument = (doc: Document): void => {
    setSelectedDocument(doc);
    setCurrentPage('pdfViewer' as PageView);
  };

  if (currentPage === 'roleSelection') {
    return (
      <Layout style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column',marginLeft:'250px' }}>
        <Content 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            padding: '50px 20px',
            flex: 1,
            width: '100%'
          }}
        >
          <div style={{ width: '100%', maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
              <h1 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '12px' }}>
                PDF Annotator
              </h1>
              <p style={{ fontSize: '18px', marginBottom: 0 }}>
                Select your role to continue
              </p>
            </div>

            <Row gutter={[24, 24]} justify="center">
              {Object.entries(USERS).map(([key, user]: [string, UserRole]) => (
                <Col xs={24} sm={12} md={11} key={key}>
                  <Card
                    onClick={() => handleRoleSelect(key)}
                  >
                    <div>
                      <h3 >
                        {user.name}
                      </h3>
                      <p >
                        Role: <span>{user.role}</span>
                      </p>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        </Content>
      </Layout>
    );
  }

  // Upload Panel
  if (currentPage === 'uploadPanel' && currentUser) {
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <Header style={{ background:'white',display: 'flex', alignItems: 'center', justifyContent: 'space-between', }}>
          <h1 style={{fontSize: '18px' }}>PDF Annotator</h1>
          <Space>
            <span>Current User: <strong>{userInfo?.name}</strong></span>
            <UserSwitcher currentUser={currentUser} onUserChange={handleUserChange} />
            <Button danger icon={<LogoutOutlined />} onClick={handleLogout}>
              Logout
            </Button>
          </Space>
        </Header>

        <Content style={{marginLeft:'250px'}}>
          <Row justify="space-between" >
            <Col>
              <Button onClick={handleBackToDocuments}>
                 Back to Documents
              </Button>
            </Col>
          </Row>
          <UploadPanel currentUser={currentUser} />
        </Content>
      </Layout>
    );
  }

  // Document List Screen
  if (currentPage === 'documentList' && currentUser && userInfo) {
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <Header style={{ backgroundColor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
          <h1 style={{ margin: 0, fontSize: '18px' }}>PDF Annotator</h1>
          <Space>
            <span>Current User: <strong>{userInfo.name}</strong></span>
            <UserSwitcher currentUser={currentUser} onUserChange={handleUserChange} />
            <Button danger icon={<LogoutOutlined />} onClick={handleLogout}>
              Logout
            </Button>
          </Space>
        </Header>

        {(canUpload || canAnnotate) && (
          <div style={{ backgroundColor: '#fff'}}>
            <Space>
              {canUpload && (
                <Button type="primary" onClick={handleOpenUpload}>
                  Upload PDF
                </Button>
              )}
              
            </Space>
          </div>
        )}

        <Content>
          <DocumentList currentUser={currentUser} userInfo={userInfo} onViewDocument={handleViewDocument} />
        </Content>
      </Layout>
    );
  }

  // PDF Viewer Screen with Annotations
  if (currentPage === 'pdfViewer' && currentUser && selectedDocument && userInfo) {
    return (
      <PDFViewer
        document={selectedDocument}
        currentUser={currentUser}
        onBack={handleBackToDocuments}
        canAnnotate={canAnnotate}
      />
    );
  }

  return null;
}

export default App;