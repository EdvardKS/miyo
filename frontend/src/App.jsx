import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Feed from './pages/Feed';
import TopUsers from './pages/TopUsers';
import CreateParty from './pages/CreateParty';
import PartyGallery from './pages/PartyGallery';
import Profile from './pages/Profile';
import MyPhotos from './pages/MyPhotos';
import Privacy from './pages/Privacy';
import Search from './pages/Search.jsx';
import Settings from './pages/Settings.jsx';
import ProtectedRoute from './components/ProtectedRoute';
import { ThemeProvider } from './contexts/ThemeContext';

const queryClient = new QueryClient();

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <SocketProvider>
            <Router>
              <div className="min-h-screen ui-shell">
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route
                    path="/"
                    element={(
                      <ProtectedRoute>
                        <Layout>
                          <Feed />
                        </Layout>
                      </ProtectedRoute>
                    )}
                  />
                  <Route
                    path="/top"
                    element={(
                      <ProtectedRoute>
                        <Layout>
                          <TopUsers />
                        </Layout>
                      </ProtectedRoute>
                    )}
                  />
                  <Route
                    path="/create"
                    element={(
                      <ProtectedRoute>
                        <Layout>
                          <CreateParty />
                        </Layout>
                      </ProtectedRoute>
                    )}
                  />
                  <Route
                    path="/gallery/:code"
                    element={(
                      <ProtectedRoute>
                        <PartyGallery />
                      </ProtectedRoute>
                    )}
                  />
                  <Route
                    path="/profile/:username?"
                    element={(
                      <ProtectedRoute>
                        <Layout>
                          <Profile />
                        </Layout>
                      </ProtectedRoute>
                    )}
                  />
                  <Route
                    path="/settings"
                    element={(
                      <ProtectedRoute>
                        <Layout>
                          <Settings />
                        </Layout>
                      </ProtectedRoute>
                    )}
                  />
                  <Route
                    path="/my-photos"
                    element={(
                      <ProtectedRoute>
                        <Layout>
                          <MyPhotos />
                        </Layout>
                      </ProtectedRoute>
                    )}
                  />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route
                    path="/search"
                    element={(
                      <ProtectedRoute>
                        <Layout>
                          <Search />
                        </Layout>
                      </ProtectedRoute>
                    )}
                  />
                </Routes>
                <Toaster />
              </div>
            </Router>
          </SocketProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
