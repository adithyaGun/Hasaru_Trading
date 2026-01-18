import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductById } from '../../store/slices/productsSlice';
import { addToCart } from '../../store/slices/cartSlice';
import { Button, InputNumber, Spin, Descriptions, Tag } from 'antd';
import { ShoppingCartOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { product, loading } = useSelector((state) => state.products);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    dispatch(fetchProductById(id));
  }, [dispatch, id]);

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    dispatch(addToCart({ product_id: product.id, quantity }));
  };

  if (loading || !product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Spin size="large" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-1 bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate('/products')}
            className="mb-6"
          >
            Back to Products
          </Button>

          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Product Image */}
              <div className="flex items-center justify-center bg-gray-100 rounded-lg p-8">
                <span className="text-9xl">📦</span>
              </div>

              {/* Product Details */}
              <div>
                <h1 className="text-3xl font-bold mb-4">{product.product_name}</h1>
                
                <div className="mb-4">
                  <Tag color="blue">{product.category}</Tag>
                  <Tag color="green">{product.brand}</Tag>
                </div>

                <div className="mb-6">
                  <p className="text-3xl font-bold text-red-600">
                    Rs. {parseFloat(product.selling_price).toFixed(2)}
                  </p>
                </div>

                <Descriptions bordered column={1} className="mb-6">
                  <Descriptions.Item label="Product Code">{product.product_code}</Descriptions.Item>
                  <Descriptions.Item label="Category">{product.category}</Descriptions.Item>
                  <Descriptions.Item label="Brand">{product.brand}</Descriptions.Item>
                  <Descriptions.Item label="Stock Status">
                    {product.stock_quantity > 0 ? (
                      <Tag color="success">In Stock ({product.stock_quantity} units)</Tag>
                    ) : (
                      <Tag color="error">Out of Stock</Tag>
                    )}
                  </Descriptions.Item>
                  {product.description && (
                    <Descriptions.Item label="Description">{product.description}</Descriptions.Item>
                  )}
                </Descriptions>

                {product.stock_quantity > 0 && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-2">Quantity:</label>
                    <InputNumber
                      min={1}
                      max={product.stock_quantity}
                      value={quantity}
                      onChange={setQuantity}
                      size="large"
                      className="w-32"
                    />
                  </div>
                )}

                <Button
                  type="primary"
                  size="large"
                  icon={<ShoppingCartOutlined />}
                  onClick={handleAddToCart}
                  disabled={product.stock_quantity === 0}
                  className="w-full md:w-auto"
                >
                  {product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ProductDetail;
