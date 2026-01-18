import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Result, Button } from 'antd';
import { Link } from 'react-router-dom';

const RoleBasedRoute = ({ allowedRoles }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user?.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Result
          status="403"
          title="403"
          subTitle="Sorry, you are not authorized to access this page."
          extra={
            <Link to={`/${user?.role || ''}`}>
              <Button type="primary">Go to Dashboard</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return <Outlet />;
};

export default RoleBasedRoute;
