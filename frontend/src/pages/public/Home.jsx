import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../../store/slices/productsSlice';
import { Button, Card, Spin } from 'antd';
import { 
  ShoppingCart, 
  ArrowRight, 
  CheckCircle, 
  Truck, 
  DollarSign,
  Shield,
  Clock,
  Users,
  Star,
  Package,
  Wrench,
  Zap,
  Award,
  HeadphonesIcon
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const { Meta } = Card;

const Home = () => {
  const dispatch = useDispatch();
  const { products, loading } = useSelector((state) => state.products);
  const [featuredProducts, setFeaturedProducts] = useState([]);

  useEffect(() => {
    dispatch(fetchProducts({ limit: 8 }));
  }, [dispatch]);

  useEffect(() => {
    if (products.length > 0) {
      setFeaturedProducts(products.slice(0, 8));
    }
  }, [products]);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-black via-red-950 to-red-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDEzNGg3djFoLTd2LTF6bS0yLTFoMXYyaC0xdi0yeiIvPjwvZz48L2c+PC9zdmc+')] opacity-20"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-fadeIn">
              <div className="inline-flex items-center space-x-2 bg-red-600/20 backdrop-blur-sm border border-red-500/30 rounded-full px-4 py-2">
                <Award className="w-4 h-4 text-red-400" />
                <span className="text-sm font-medium text-red-100">Premium Quality Products</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold leading-tight">
                Your Trusted
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-600">
                  Auto Parts
                </span>
                Partner
              </h1>
              
              <p className="text-xl text-gray-300 leading-relaxed max-w-xl">
                Quality tires and automotive parts at unbeatable prices. 
                Expert service, fast delivery, and products you can trust.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/products">
                  <Button 
                    type="primary" 
                    size="large" 
                    className="!h-14 !px-8 !text-lg font-semibold !bg-red-600 hover:!bg-red-700 border-0 shadow-lg shadow-red-900/50"
                    icon={<ShoppingCart className="w-5 h-5" />}
                  >
                    Shop Now
                  </Button>
                </Link>
                <Link to="/products">
                  <Button 
                    size="large" 
                    className="!h-14 !px-8 !text-lg font-semibold !bg-white/10 hover:!bg-white/20 !text-white border-white/20 backdrop-blur-sm"
                    icon={<Package className="w-5 h-5" />}
                  >
                    Browse Catalog
                  </Button>
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/10">
                <div>
                  <div className="text-3xl font-bold text-red-400">5000+</div>
                  <div className="text-sm text-gray-400">Products</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-red-400">10k+</div>
                  <div className="text-sm text-gray-400">Happy Clients</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-red-400">15+</div>
                  <div className="text-sm text-gray-400">Years Experience</div>
                </div>
              </div>
            </div>

            {/* Hero Image Placeholder */}
            <div className="hidden md:flex justify-center items-center">
              <div className="relative">
                <div className="absolute inset-0 bg-red-600/20 rounded-full blur-3xl"></div>
                <div className="relative bg-gradient-to-br from-red-500/20 to-red-600/5 backdrop-blur-sm border border-red-500/20 rounded-3xl p-12">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                      <Wrench className="w-12 h-12 text-red-400 mb-3" />
                      <div className="text-2xl font-bold">Auto Parts</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                      <Package className="w-12 h-12 text-red-400 mb-3" />
                      <div className="text-2xl font-bold">Tires</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                      <Shield className="w-12 h-12 text-red-400 mb-3" />
                      <div className="text-2xl font-bold">Quality</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                      <Zap className="w-12 h-12 text-red-400 mb-3" />
                      <div className="text-2xl font-bold">Fast</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Why Choose Us</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We provide exceptional service and quality products to keep your vehicle running smoothly
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="group p-8 rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 hover:border-red-200 hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Quality Guarantee</h3>
              <p className="text-gray-600 leading-relaxed">
                All products are sourced from trusted suppliers with comprehensive quality assurance and warranties
              </p>
            </div>

            <div className="group p-8 rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 hover:border-red-200 hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Truck className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Fast Delivery</h3>
              <p className="text-gray-600 leading-relaxed">
                Quick and reliable delivery service to get your products when you need them most
              </p>
            </div>

            <div className="group p-8 rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 hover:border-red-200 hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <DollarSign className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Best Prices</h3>
              <p className="text-gray-600 leading-relaxed">
                Competitive pricing with regular promotions and discounts on premium products
              </p>
            </div>

            <div className="group p-8 rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 hover:border-red-200 hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">24/7 Support</h3>
              <p className="text-gray-600 leading-relaxed">
                Round-the-clock customer support to assist you with any questions or concerns
              </p>
            </div>

            <div className="group p-8 rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 hover:border-red-200 hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Expert Team</h3>
              <p className="text-gray-600 leading-relaxed">
                Knowledgeable staff ready to help you find the perfect parts for your vehicle
              </p>
            </div>

            <div className="group p-8 rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 hover:border-red-200 hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Easy Returns</h3>
              <p className="text-gray-600 leading-relaxed">
                Hassle-free return policy to ensure your complete satisfaction with every purchase
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Shop by Category</h2>
            <p className="text-xl text-gray-600">Find exactly what you need for your vehicle</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Link to="/products?category=Tires" className="group">
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-black to-red-950 p-10 h-80 flex flex-col justify-end transform hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                <div className="absolute top-8 right-8 bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <Package className="w-16 h-16 text-red-400" />
                </div>
                <div className="relative z-10">
                  <h3 className="text-4xl font-bold text-white mb-3">Tires</h3>
                  <p className="text-gray-300 mb-4">Premium quality tires for all vehicles</p>
                  <div className="inline-flex items-center text-red-400 font-semibold group-hover:gap-3 gap-2 transition-all">
                    Shop Now <ArrowRight className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </Link>

            <Link to="/products?category=Batteries" className="group">
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-red-900 to-red-950 p-10 h-80 flex flex-col justify-end transform hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                <div className="absolute top-8 right-8 bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <Zap className="w-16 h-16 text-red-400" />
                </div>
                <div className="relative z-10">
                  <h3 className="text-4xl font-bold text-white mb-3">Batteries</h3>
                  <p className="text-gray-300 mb-4">Long-lasting automotive batteries</p>
                  <div className="inline-flex items-center text-red-400 font-semibold group-hover:gap-3 gap-2 transition-all">
                    Shop Now <ArrowRight className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </Link>

            <Link to="/products?category=Spare Parts" className="group">
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 to-black p-10 h-80 flex flex-col justify-end transform hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                <div className="absolute top-8 right-8 bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <Wrench className="w-16 h-16 text-red-400" />
                </div>
                <div className="relative z-10">
                  <h3 className="text-4xl font-bold text-white mb-3">Spare Parts</h3>
                  <p className="text-gray-300 mb-4">Genuine auto parts and accessories</p>
                  <div className="inline-flex items-center text-red-400 font-semibold group-hover:gap-3 gap-2 transition-all">
                    Shop Now <ArrowRight className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-2">Featured Products</h2>
              <p className="text-xl text-gray-600">Hand-picked products just for you</p>
            </div>
            <Link to="/products">
              <Button 
                type="text" 
                size="large" 
                className="!text-red-600 hover:!text-red-700 font-semibold"
                icon={<ArrowRight className="w-5 h-5" />}
              >
                View All
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <Spin size="large" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <Link key={product.id} to={`/product/${product.id}`}>
                  <div className="group bg-white rounded-2xl overflow-hidden border border-gray-200 hover:border-red-300 hover:shadow-xl transition-all duration-300">
                    <div className="h-56 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <Package className="w-20 h-20 text-gray-300 group-hover:text-red-400 transition-colors" />
                    </div>
                    <div className="p-6">
                      <div className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-2">
                        {product.category}
                      </div>
                      <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-red-600 transition-colors">
                        {product.product_name}
                      </h3>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-red-600">
                          Rs. {parseFloat(product.selling_price).toFixed(2)}
                        </span>
                        {product.stock_quantity > 0 ? (
                          <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
                            In Stock
                          </span>
                        ) : (
                          <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full font-medium">
                            Out of Stock
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">What Our Customers Say</h2>
            <p className="text-xl text-gray-600">Don't just take our word for it</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl border border-gray-200 hover:border-red-200 hover:shadow-lg transition-all">
                <div className="flex items-center gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-5 h-5 fill-red-500 text-red-500" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  "Excellent service and quality products. The team was very helpful in finding the right parts for my vehicle. Highly recommended!"
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {String.fromCharCode(64 + i)}
                  </div>
                  <div>
                    <div className="font-bold">Customer {i}</div>
                    <div className="text-sm text-gray-500">Verified Buyer</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-black via-red-950 to-red-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-4xl md:text-6xl font-bold">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-gray-300">
              Browse our extensive catalog and find the perfect parts for your vehicle today
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/products">
                <Button 
                  type="primary" 
                  size="large" 
                  className="!h-14 !px-8 !text-lg font-semibold !bg-red-600 hover:!bg-red-700 border-0"
                  icon={<ShoppingCart className="w-5 h-5" />}
                >
                  Shop Now
                </Button>
              </Link>
              <Link to="/register">
                <Button 
                  size="large" 
                  className="!h-14 !px-8 !text-lg font-semibold !bg-white !text-black hover:!bg-gray-100 border-0"
                >
                  Create Account
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
