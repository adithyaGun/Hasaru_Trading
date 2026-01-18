import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, fetchCategories, fetchBrands } from '../../store/slices/productsSlice';
import { addToCart } from '../../store/slices/cartSlice';
import { Card, Button, Input, Select, Pagination, Spin, Empty } from 'antd';
import { ShoppingCartOutlined, SearchOutlined } from '@ant-design/icons';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const { Meta } = Card;
const { Option } = Select;

const Products = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { products, categories, brands, pagination, loading } = useSelector((state) => state.products);
  const { isAuthenticated } = useSelector((state) => state.auth);

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

      <div className="flex-1 bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-8">Products</h1>

          {/* Filters */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                placeholder="Search products..."
                prefix={<SearchOutlined />}
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
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
                onClick={() => setFilters({
                  search: '',
                  category: '',
                  brand: '',
                  page: 1,
                  limit: 20,
                })}
              >
                Clear Filters
              </Button>
            </div>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="text-center py-12">
              <Spin size="large" />
            </div>
          ) : products.length === 0 ? (
            <Empty description="No products found" />
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
                {products.map((product) => (
                  <Card
                    key={product.id}
                    hoverable
                    cover={
                      <Link to={`/product/${product.id}`}>
                        <div className="h-48 bg-gray-200 flex items-center justify-center">
                          <span className="text-4xl">📦</span>
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
                        title={
                          <div className="truncate" title={product.product_name}>
                            {product.product_name}
                          </div>
                        }
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
