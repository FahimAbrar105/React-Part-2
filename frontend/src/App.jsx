import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ChatInbox from './pages/ChatInbox';
import ChatRoom from './pages/ChatRoom';
import ProductDetails from './pages/ProductDetails';
import RequireAuth from './components/RequireAuth';
import Layout from './components/Layout';
import Home from './pages/Home';
import Marketplace from './pages/Marketplace';
import CreateProduct from './pages/CreateProduct';

function App() {
  return (
    <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Login />} /> {/* Temporary: point register to login for now or create generic auth page */}

                    <Route
            path="/"
            element={
            <Layout>
                                <Home />
                            </Layout>
            } />
          

                    <Route
            path="/dashboard"
            element={
            <RequireAuth>
                                <Layout>
                                    <Dashboard />
                                </Layout>
                            </RequireAuth>
            } />
          

                    <Route
            path="/chat"
            element={
            <RequireAuth>
                                <Layout>
                                    <ChatInbox />
                                </Layout>
                            </RequireAuth>
            } />
          

                    <Route
            path="/chat/:userId"
            element={
            <RequireAuth>
                                <Layout>
                                    <ChatRoom />
                                </Layout>
                            </RequireAuth>
            } />
          

                    <Route
            path="/products/create"
            element={
            <RequireAuth>
                                <Layout>
                                    <CreateProduct />
                                </Layout>
                            </RequireAuth>
            } />
          

                    <Route
            path="/products/:id"
            element={
            <RequireAuth>
                                <Layout>
                                    <ProductDetails />
                                </Layout>
                            </RequireAuth>
            } />
          
                    <Route
            path="/products"
            element={
            <RequireAuth>
                                <Layout>
                                    <Marketplace />
                                </Layout>
                            </RequireAuth>
            } />
          
                </Routes>
            </BrowserRouter>
        </AuthProvider>);

}

export default App;