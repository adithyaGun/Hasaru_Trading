import AdminLayout from '../../components/admin/AdminLayout';
import { Card } from 'antd';

const AdminReports = () => {
  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">Reports</h1>
      <Card>
        <p>Sales and inventory reports coming soon...</p>
      </Card>
    </AdminLayout>
  );
};

export default AdminReports;
