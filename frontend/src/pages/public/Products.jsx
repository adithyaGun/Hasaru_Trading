import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, fetchCategories, fetchBrands } from '../../store/slices/productsSlice';
import { addToCart } from '../../store/slices/cartSlice';
import { Card, Button, Input, Select, Pagination, Spin, Empty } from 'antd';
import { ShoppingCartOutlined, SearchOutlined } from '@ant-design/icons';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { getImageUrl } from '../../config/constants';

const { Meta } = Card;
const { Option } = Select;

const Products = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { products, categories, brands, pagination, loading } = useSelector((state) => state.products);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    brand: searchParams.get('brand') || '',
    page: parseInt(searchParams.get('page')) || 1,
    limit: 20,
  });

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchBrands());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchProducts(filters));
  }, [dispatch, filters]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== filters.search) {
        handleFilterChange('search', searchInput);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value, page: 1 };
    setFilters(newFilters);
    
    // Update URL params
    const params = {};
    if (newFilters.search) params.search = newFilters.search;
    if (newFilters.category) params.category = newFilters.category;
    if (newFilters.brand) params.brand = newFilters.brand;
    if (newFilters.page > 1) params.page = newFilters.page;
    setSearchParams(params);
  };

  const handlePageChange = (page) => {
    setFilters({ ...filters, page });
    window.scrollTo(0, 0);
  };

  const handleAddToCart = (product) => {
    if (isAuthenticated) {
      dispatch(addToCart({ product_id: product.id, quantity: 1 }));
    } else {
      // Redirect to login
      window.location.href = '/login';
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-1 bg-gray-50 py-8" style={{ minHeight: '70vh' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-8">Products</h1>

          {/* Filters */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                placeholder="Search products..."
                prefix={<SearchOutlined />}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                size="large"
              />
              
              <Select
                placeholder="All Categories"
                value={filters.category || undefined}
                onChange={(value) => handleFilterChange('category', value)}
                size="large"
                allowClear
              >
                {categories.map((cat) => (
                  <Option key={cat} value={cat}>{cat}</Option>
                ))}
              </Select>

              <Select
                placeholder="All Brands"
                value={filters.brand || undefined}
                onChange={(value) => handleFilterChange('brand', value)}
                size="large"
                allowClear
              >
                {brands.map((brand) => (
                  <Option key={brand} value={brand}>{brand}</Option>
                ))}
              </Select>

              <Button
                type="primary"
                size="large"
                onClick={() => {
                  setSearchInput('');
                  setFilters({
                    search: '',
                    category: '',
                    brand: '',
                    page: 1,
                    limit: 20,
                  });
                  setSearchParams({});
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="text-center py-12" style={{ minHeight: '400px' }}>
              <Spin size="large" />
            </div>
          ) : products.length === 0 ? (
            <div style={{ minHeight: '400px' }}>
              <Empty description="No products found" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
                {products.map((product) => (
                  <Card
                    key={product.id}
                    hoverable
                    cover={
                      <Link to={`/product/${product.id}`}>
                        <div className="h-48 bg-gray-200 flex items-center justify-center overflow-hidden">
                          {product.image_url ? (
                            <img
                              src={getImageUrl(product.image_url)}
                              alt={product.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div style={{ display: product.image_url ? 'none' : 'flex' }} className="w-full h-full items-center justify-center">
                            <span className="text-4xl">📦</span>
                          </div>
                        </div>
                      </Link>
                    }
                    actions={[
                      <Button
                        type="text"
                        icon={<ShoppingCartOutlined />}
                        onClick={() => handleAddToCart(product)}
                        disabled={product.stock_quantity === 0}
                      >
                        {product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                      </Button>
                    ]}
                  >
                    <Link to={`/product/${product.id}`}>
                      <Meta
                        title={(
                          <div 
                            style={{ 
                              height: '48px',
                              lineHeight: '24px',
                              overflow: 'hidden',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              wordBreak: 'break-word',
                              fontSize: '16px',
                              fontWeight: 500
                            }}
                            title={product.name}
                          >
                            {product.name}
                          </div>
                        )}
                        description={
                          <div>
                            <p className="text-gray-500 text-sm mb-1">{product.brand}</p>
                            <p className="text-gray-400 text-xs mb-2">{product.category}</p>
                            <p className="text-red-600 font-bold text-lg">
                              Rs. {parseFloat(product.selling_price).toFixed(2)}
                            </p>
                            <p className={`text-xs mt-1 ${product.stock_quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {product.stock_quantity > 0 ? `In Stock (${product.stock_quantity})` : 'Out of Stock'}
                            </p>
                          </div>
                        }
                      />
                    </Link>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              <div className="flex justify-center">
                <Pagination
                  current={pagination.page}
                  total={pagination.total}
                  pageSize={pagination.limit}
                  onChange={handlePageChange}
                  showSizeChanger={false}
                  showTotal={(total) => `Total ${total} products`}
                />
              </div>
            </>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Products;
