import { 
  Award, 
  Users, 
  Target, 
  TrendingUp, 
  Shield, 
  Heart,
  CheckCircle,
  Package,
  Clock,
  Wrench
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const About = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-black via-red-950 to-red-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDEzNGg3djFoLTd2LTF6bS0yLTFoMXYyaC0xdi0yeiIvPjwvZz48L2c+PC9zdmc+')] opacity-20"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center space-x-2 bg-red-600/20 backdrop-blur-sm border border-red-500/30 rounded-full px-4 py-2 mb-8">
              <Award className="w-4 h-4 text-red-400" />
              <span className="text-sm font-medium text-red-100">About Hasaru Trading</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
              Your Trusted Partner in
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-600">
                Auto Parts Excellence
              </span>
            </h1>
            
            <p className="text-xl text-gray-300 leading-relaxed">
              For over 15 years, we've been providing quality automotive parts and exceptional service to customers across the nation.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="group p-10 rounded-3xl bg-gradient-to-br from-red-50 to-white border-2 border-red-100 hover:border-red-300 hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
              <p className="text-gray-700 leading-relaxed text-lg">
                To provide our customers with the highest quality automotive parts at competitive prices, 
                while delivering exceptional service and expert guidance. We strive to be the most trusted 
                name in the auto parts industry.
              </p>
            </div>

            <div className="group p-10 rounded-3xl bg-gradient-to-br from-black to-red-950 text-white hover:shadow-2xl transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-red-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold mb-4">Our Vision</h2>
              <p className="text-gray-300 leading-relaxed text-lg">
                To become the leading automotive parts supplier in the region, known for innovation, 
                reliability, and customer satisfaction. We envision a future where every vehicle owner 
                has access to quality parts and expert service.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-5xl md:text-6xl font-bold text-red-600 mb-2">15+</div>
              <div className="text-gray-600 font-medium">Years Experience</div>
            </div>
            <div className="text-center">
              <div className="text-5xl md:text-6xl font-bold text-red-600 mb-2">10k+</div>
              <div className="text-gray-600 font-medium">Happy Customers</div>
            </div>
            <div className="text-center">
              <div className="text-5xl md:text-6xl font-bold text-red-600 mb-2">5000+</div>
              <div className="text-gray-600 font-medium">Products</div>
            </div>
            <div className="text-center">
              <div className="text-5xl md:text-6xl font-bold text-red-600 mb-2">24/7</div>
              <div className="text-gray-600 font-medium">Support Available</div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Our Core Values</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 hover:border-red-200 hover:shadow-xl transition-all">
              <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Quality First</h3>
              <p className="text-gray-600 leading-relaxed">
                We never compromise on quality. Every product we sell meets the highest industry standards and comes with our guarantee.
              </p>
            </div>

            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 hover:border-red-200 hover:shadow-xl transition-all">
              <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Customer Focus</h3>
              <p className="text-gray-600 leading-relaxed">
                Our customers are at the heart of everything we do. We're dedicated to providing exceptional service and support.
              </p>
            </div>

            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 hover:border-red-200 hover:shadow-xl transition-all">
              <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Integrity</h3>
              <p className="text-gray-600 leading-relaxed">
                We believe in honest, transparent business practices. You can trust us to always do what's right.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Why Choose Hasaru Trading?</h2>
            <p className="text-xl text-gray-600">
              Here's what sets us apart from the competition
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                icon: Package,
                title: 'Extensive Inventory',
                description: 'Over 5,000 products from trusted manufacturers, ensuring you find exactly what you need.'
              },
              {
                icon: Shield,
                title: 'Quality Guarantee',
                description: 'All products come with comprehensive warranties and quality certifications.'
              },
              {
                icon: Users,
                title: 'Expert Team',
                description: 'Our knowledgeable staff has years of experience and can help you find the perfect parts.'
              },
              {
                icon: Clock,
                title: 'Fast Delivery',
                description: 'Quick processing and reliable delivery to get your parts when you need them.'
              },
              {
                icon: Award,
                title: 'Competitive Pricing',
                description: 'Best prices in the market with regular promotions and discounts.'
              },
              {
                icon: Wrench,
                title: 'Professional Service',
                description: 'From selection to installation support, we are here to help every step of the way.'
              }
            ].map((item, index) => (
              <div key={index} className="flex gap-6 p-6 rounded-2xl bg-white border border-gray-200 hover:border-red-300 hover:shadow-lg transition-all">
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                    <item.icon className="w-7 h-7 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Meet Our Team</h2>
            <p className="text-xl text-gray-600">
              Dedicated professionals committed to your satisfaction
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: 'Management Team', role: 'Leadership', desc: 'Strategic vision and company direction' },
              { name: 'Sales Team', role: 'Customer Service', desc: 'Expert product knowledge and support' },
              { name: 'Technical Team', role: 'Quality Control', desc: 'Ensuring product excellence' }
            ].map((member, index) => (
              <div key={index} className="group text-center">
                <div className="mb-6 relative">
                  <div className="w-48 h-48 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl mx-auto flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Users className="w-24 h-24 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-2">{member.name}</h3>
                <div className="text-red-600 font-semibold mb-3">{member.role}</div>
                <p className="text-gray-600">{member.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
