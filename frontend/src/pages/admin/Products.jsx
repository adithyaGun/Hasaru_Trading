import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { 
  Table, 
  Button, 
  Modal, 
  Form, 
  Input, 
  InputNumber, 
  Select, 
  Space, 
  Tag, 
  Popconfirm, 
  message,
  Row,
  Col,
  Card,
  Statistic,
  Badge,
  Tooltip,
  Upload,
  Image
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  SearchOutlined,
  ReloadOutlined,
  ExportOutlined,
  EyeOutlined,
  UploadOutlined
} from '@ant-design/icons';
import api from '../../api/axios';
import { getImageUrl } from '../../config/constants';

const { Option } = Select;
const { TextArea } = Input;

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [batchesModalVisible, setBatchesModalVisible] = useState(false);
  const [selectedProductBatches, setSelectedProductBatches] = useState([]);
  const [batchesLoading, setBatchesLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    lowStock: 0,
    outOfStock: 0
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await api.get('/products');
      // Backend returns { success, message, data: { products, pagination } }
      const productsData = response.data?.data?.products || [];
      setProducts(productsData);
      calculateStats(productsData);
      message.success('Products loaded successfully');
    } catch (error) {
      message.error('Failed to load products');
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (productsData) => {
    if (!Array.isArray(productsData)) {
      setStats({ total: 0, active: 0, lowStock: 0, outOfStock: 0 });
      return;
    }
    const total = productsData.length;
    const active = productsData.filter(p => p.is_active === 1).length;
    const lowStock = productsData.filter(p => p.stock_quantity > 0 && p.stock_quantity <= p.reorder_level).length;
    const outOfStock = productsData.filter(p => p.stock_quantity === 0).length;
    setStats({ total, active, lowStock, outOfStock });
  };

  const handleAdd = () => {
    setEditingProduct(null);
    form.resetFields();
    setImageFile(null);
    setImagePreview(null);
    setFileList([]);
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingProduct(record);
    form.setFieldsValue({
      ...record,
      category: record.category || undefined,
      brand: record.brand || undefined
    });
    setImageFile(null);
    setImagePreview(record.image_url ? getImageUrl(record.image_url) : null);
    setFileList([]);
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/products/${id}`);
      message.success('Product deleted successfully');
      fetchProducts();
    } catch (error) {
      message.error('Failed to delete product');
      console.error('Error deleting product:', error);
    }
  };

  const handleViewBatches = async (product) => {
    setBatchesLoading(true);
    setBatchesModalVisible(true);
    try {
      const response = await api.get(`/batches/${product.id}`);
      setSelectedProductBatches({
        product: product,
        batches: response.data.data || []
      });
    } catch (error) {
      message.error('Failed to load batches');
      console.error('Error loading batches:', error);
      setSelectedProductBatches({ product: product, batches: [] });
    } finally {
      setBatchesLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    try {
      const formData = new FormData();
      
      // Append all form values to FormData
      Object.keys(values).forEach(key => {
        if (values[key] !== undefined && values[key] !== null) {
          formData.append(key, values[key]);
        }
      });

      // Append image file if selected
      if (imageFile) {
        formData.append('image', imageFile);
      }

      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        message.success('Product updated successfully');
      } else {
        await api.post('/products', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        message.success('Product created successfully');
      }
      
      // Reset form and state
      setModalVisible(false);
      form.resetFields();
      setImageFile(null);
      setImagePreview(null);
      setEditingProduct(null);
      setFileList([]);
      
      // Refresh products list to get updated data
      await fetchProducts();
    } catch (error) {
      message.error(editingProduct ? 'Failed to update product' : 'Failed to create product');
      console.error('Error saving product:', error);
    }
  };

  const handleImageChange = (info) => {
    const file = info.file.originFileObj || info.file;
    setImageFile(file);
    setFileList([info.file]);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setFileList([]);
  };

  const getStockStatus = (stock, reorderLevel) => {
    if (stock === 0) return { color: 'red', text: 'Out of Stock' };
    if (stock <= reorderLevel) return { color: 'orange', text: 'Low Stock' };
    return { color: 'green', text: 'In Stock' };
  };

  const filteredProducts = (Array.isArray(products) ? products : []).filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchText.toLowerCase()) ||
                         product.sku?.toLowerCase().includes(searchText.toLowerCase());
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && product.is_active === 1) || 
                         (filterStatus === 'inactive' && product.is_active === 0);
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const columns = [
    {
      title: 'Image',
      dataIndex: 'image_url',
      key: 'image_url',
      width: 80,
      render: (image_url) => (
        image_url ? (
          <Image
            width={50}
            height={50}
            src={getImageUrl(image_url)}
            alt="Product"
            style={{ objectFit: 'cover', borderRadius: '4px' }}
            fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
          />
        ) : (
          <div style={{ width: 50, height: 50, background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px' }}>
            <span style={{ fontSize: '24px' }}>📦</span>
          </div>
        )
      ),
    },
    {
      title: 'SKU',
      dataIndex: 'sku',
      key: 'sku',
      width: 120,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: 200,
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      width: 120,
    },
    {
      title: 'Brand',
      dataIndex: 'brand',
      key: 'brand',
      width: 100,
    },
    {
      title: 'Price',
      dataIndex: 'selling_price',
      key: 'selling_price',
      width: 100,
      render: (price) => `Rs. ${parseFloat(price).toFixed(2)}`,
    },
    {
      title: 'Stock',
      dataIndex: 'stock_quantity',
      key: 'stock_quantity',
      width: 80,
      render: (stock, record) => {
        const status = getStockStatus(stock, record.reorder_level);
        return <Badge status={status.color === 'red' ? 'error' : status.color === 'orange' ? 'warning' : 'success'} text={stock} />;
      },
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      width: 100,
      render: (is_active) => (
        <Tag color={is_active === 1 ? 'green' : 'red'}>
          {is_active === 1 ? 'ACTIVE' : 'INACTIVE'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space>
          <Tooltip title="View Batches">
            <Button 
              type="link" 
              icon={<EyeOutlined />} 
              onClick={() => handleViewBatches(record)}
            >
              Batches
            </Button>
          </Tooltip>
          <Button 
            type="link" 
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this product?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="mb-6">
        {/* Statistics Cards */}
        <Row gutter={16} className="mb-6">
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic 
                title="Total Products" 
                value={stats.total}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic 
                title="Active Products" 
                value={stats.active}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic 
                title="Low Stock" 
                value={stats.lowStock}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic 
                title="Out of Stock" 
                value={stats.outOfStock}
                valueStyle={{ color: '#f5222d' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Filters and Actions */}
        <Card className="mb-4">
          <Row gutter={16} align="middle">
            <Col xs={24} md={8}>
              <Input
                placeholder="Search by name or SKU"
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
              />
            </Col>
            <Col xs={24} md={5}>
              <Select
                style={{ width: '100%' }}
                placeholder="Filter by Category"
                value={filterCategory}
                onChange={setFilterCategory}
              >
                <Option value="all">All Categories</Option>
                <Option value="Tires">Tires</Option>
                <Option value="Batteries">Batteries</Option>
                <Option value="Engine Oil">Engine Oil</Option>
                <Option value="Brake Pads">Brake Pads</Option>
                <Option value="Filters">Filters</Option>
                <Option value="Spark Plugs">Spark Plugs</Option>
                <Option value="Wipers">Wipers</Option>
                <Option value="Coolants">Coolants</Option>
              </Select>
            </Col>
            <Col xs={24} md={5}>
              <Select
                style={{ width: '100%' }}
                placeholder="Filter by Status"
                value={filterStatus}
                onChange={setFilterStatus}
              >
                <Option value="all">All Status</Option>
                <Option value="active">Active</Option>
                <Option value="inactive">Inactive</Option>
              </Select>
            </Col>
            <Col xs={24} md={6} className="text-right">
              <Space>
                <Button 
                  icon={<ReloadOutlined />} 
                  onClick={fetchProducts}
                >
                  Refresh
                </Button>
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  onClick={handleAdd}
                  style={{ backgroundColor: '#dc2626' }}
                >
                  Add Product
                </Button>
              </Space>
            </Col>
          </Row>
        </Card>

        {/* Products Table */}
        <Card>
          <Table
            columns={columns}
            dataSource={filteredProducts}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} products`,
            }}
            scroll={{ x: 1000 }}
          />
        </Card>
      </div>

      {/* Add/Edit Product Modal */}
      <Modal
        title={editingProduct ? 'Edit Product' : 'Add New Product'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setImageFile(null);
          setImagePreview(null);
          setEditingProduct(null);
          setFileList([]);
        }}
        onOk={() => form.submit()}
        width={800}
        okText={editingProduct ? 'Update' : 'Create'}
        okButtonProps={{ style: { backgroundColor: '#dc2626', borderColor: '#dc2626' } }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="name"
                label="Product Name"
                rules={[{ required: true, message: 'Please enter product name' }]}
              >
                <Input placeholder="Enter product name" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="sku"
                label="SKU"
                rules={[{ required: true, message: 'Please enter SKU' }]}
              >
                <Input placeholder="Enter SKU" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="category"
                label="Category"
                rules={[{ required: true, message: 'Please select category' }]}
              >
                <Select placeholder="Select category">
                  <Option value="Tires">Tires</Option>
                  <Option value="Batteries">Batteries</Option>
                  <Option value="Engine Oil">Engine Oil</Option>
                  <Option value="Brake Pads">Brake Pads</Option>
                  <Option value="Filters">Filters</Option>
                  <Option value="Spark Plugs">Spark Plugs</Option>
                  <Option value="Wipers">Wipers</Option>
                  <Option value="Coolants">Coolants</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="brand"
                label="Brand"
                rules={[{ required: true, message: 'Please enter brand' }]}
              >
                <Input placeholder="Enter brand name" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="Description"
          >
            <TextArea rows={3} placeholder="Enter product description" />
          </Form.Item>

          <Form.Item
            label="Product Image"
            extra="Upload a product image (Max 5MB, JPG/PNG/GIF/WEBP)"
          >
            <Upload
              listType="picture-card"
              maxCount={1}
              accept="image/*"
              fileList={fileList}
              beforeUpload={() => false}
              onChange={handleImageChange}
              onRemove={handleRemoveImage}
              showUploadList={{
                showPreviewIcon: false
              }}
            >
              {!imagePreview && (
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              )}
            </Upload>
            {imagePreview && (
              <div style={{ marginTop: 8 }}>
                <Image
                  width={200}
                  src={imagePreview}
                  alt="Preview"
                />
              </div>
            )}
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item
                name="purchase_price"
                label="Purchase Price"
                rules={[{ required: true, message: 'Please enter purchase price' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="0.00"
                  min={0}
                  step={0.01}
                  prefix="Rs."
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="selling_price"
                label="Selling Price"
                rules={[{ required: true, message: 'Please enter selling price' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="0.00"
                  min={0}
                  step={0.01}
                  prefix="Rs."
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="unit"
                label="Unit"
                rules={[{ required: true, message: 'Please enter unit' }]}
                initialValue="piece"
              >
                <Select placeholder="Select unit">
                  <Option value="piece">Piece</Option>
                  <Option value="set">Set</Option>
                  <Option value="box">Box</Option>
                  <Option value="bottle">Bottle</Option>
                  <Option value="pair">Pair</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item
                name="stock_quantity"
                label="Stock Quantity"
                rules={[{ required: true, message: 'Please enter stock quantity' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="0"
                  min={0}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="reorder_level"
                label="Reorder Level"
                rules={[{ required: true, message: 'Please enter reorder level' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="0"
                  min={0}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="is_active"
                label="Status"
                rules={[{ required: true, message: 'Please select status' }]}
                initialValue={1}
              >
                <Select>
                  <Option value={1}>Active</Option>
                  <Option value={0}>Inactive</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="image_url"
            label="Image URL"
          >
            <Input placeholder="Enter image URL" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Batches Modal */}
      <Modal
        title={
          <div>
            <span>Product Batches - </span>
            <Tag color="blue">{selectedProductBatches?.product?.name}</Tag>
          </div>
        }
        open={batchesModalVisible}
        onCancel={() => setBatchesModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setBatchesModalVisible(false)}>
            Close
          </Button>
        ]}
        width={900}
      >
        <Table
          loading={batchesLoading}
          dataSource={selectedProductBatches?.batches || []}
          rowKey="id"
          pagination={false}
          columns={[
            {
              title: 'Batch Number',
              dataIndex: 'batch_number',
              key: 'batch_number',
            },
            {
              title: 'Supplier',
              dataIndex: 'supplier_name',
              key: 'supplier_name',
            },
            {
              title: 'Received',
              dataIndex: 'quantity_received',
              key: 'quantity_received',
            },
            {
              title: 'Remaining',
              dataIndex: 'quantity_remaining',
              key: 'quantity_remaining',
              render: (qty) => (
                <Tag color={qty > 0 ? 'green' : 'red'}>
                  {qty}
                </Tag>
              )
            },
            {
              title: 'Cost',
              dataIndex: 'unit_cost',
              key: 'unit_cost',
              render: (cost) => `Rs. ${parseFloat(cost).toFixed(2)}`
            },
            {
              title: 'Received Date',
              dataIndex: 'received_date',
              key: 'received_date',
              render: (date) => new Date(date).toLocaleDateString()
            },
            {
              title: 'Status',
              dataIndex: 'status',
              key: 'status',
              render: (status) => {
                const colorMap = {
                  active: 'green',
                  depleted: 'orange',
                  expired: 'red'
                };
                return (
                  <Tag color={colorMap[status] || 'default'}>
                    {status?.toUpperCase()}
                  </Tag>
                );
              }
            }
          ]}
        />
        {(!selectedProductBatches?.batches || selectedProductBatches.batches.length === 0) && (
          <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
            No batches found for this product
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
};

export default AdminProducts;
