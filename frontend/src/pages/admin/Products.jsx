import AdminLayout from '../../components/admin/AdminLayout';
import { Card } from 'antd';

const AdminProducts = () => {
  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">Products Management</h1>
      <Card>
        <p>Product management functionality coming soon...</p>
        <p className="text-gray-500 mt-2">
          This page will include product CRUD operations, inventory management, and bulk operations.
        </p>
      </Card>
    </AdminLayout>
  );
};

export default AdminProducts;
