import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import ForceResetPassword from './pages/ForceResetPassword';
import ProtectedRoute from './components/ProtectedRoute';

// Buyer Pages
import BuyerLayout from './layouts/BuyerLayout';
import BuyerDashboard from './pages/buyer/BuyerDashboard';
import RFQList from './pages/buyer/RFQList';
import CreateRFQ from './pages/buyer/CreateRFQ';
import RFQDetails from './pages/buyer/RFQDetails';
import OrdersPage from './pages/buyer/OrdersPage';
import OrderDetailsPage from './pages/buyer/OrderDetailsPage';
import DocumentsPage from './pages/buyer/DocumentsPage';
import BuyerProfilePage from './pages/buyer/BuyerProfilePage';

// Supplier Pages
import SupplierLayout from './layouts/SupplierLayout';
import SupplierDashboard from './pages/supplier/SupplierDashboard';
import AvailableRFQs from './pages/supplier/AvailableRFQs';
import SubmitQuote from './pages/supplier/SubmitQuote';
import MyQuotes from './pages/supplier/MyQuotes';
import SupplierOrders from './pages/supplier/SupplierOrders';
import SupplierOrderDetails from './pages/supplier/SupplierOrderDetails';
import SupplierProfile from './pages/supplier/SupplierProfile';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/force-reset-password" element={<ForceResetPassword />} />
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
        </Route>

        {/* Buyer Routes */}
        <Route path="/buyer" element={
          <ProtectedRoute allowedRoles={['buyer']}>
            <BuyerLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/buyer/dashboard" replace />} />
          <Route path="dashboard" element={<BuyerDashboard />} />
          <Route path="rfq" element={<RFQList />} />
          <Route path="rfq/create" element={<CreateRFQ />} />
          <Route path="rfq/:id" element={<RFQDetails />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="orders/:id" element={<OrderDetailsPage />} />
          <Route path="documents" element={<DocumentsPage />} />
          <Route path="profile" element={<BuyerProfilePage />} />
        </Route>

        {/* Supplier Routes */}
        <Route path="/supplier" element={
          <ProtectedRoute allowedRoles={['supplier']}>
            <SupplierLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/supplier/dashboard" replace />} />
          <Route path="dashboard" element={<SupplierDashboard />} />
          <Route path="rfq" element={<AvailableRFQs />} />
          <Route path="rfq/:id/quote" element={<SubmitQuote />} />
          <Route path="quotes" element={<MyQuotes />} />
          <Route path="orders" element={<SupplierOrders />} />
          <Route path="orders/:id" element={<SupplierOrderDetails />} />
          <Route path="profile" element={<SupplierProfile />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
