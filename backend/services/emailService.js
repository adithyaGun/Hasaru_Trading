const { transporter } = require('../config/email');
const logger = require('../utils/logger');

// Email template header
const getEmailHeader = () => `
  <div style="background: linear-gradient(135deg, #1a1a1a 0%, #dc2626 100%); padding: 30px 20px; text-align: center;">
    <div style="background: white; border-radius: 50%; width: 80px; height: 80px; margin: 0 auto 15px; display: inline-flex; align-items: center; justify-content: center;">
      <svg width="50" height="50" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M5 11L6.5 6H17.5L19 11M5 11V19H19V11M5 11H19M9 15H15" stroke="#dc2626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="8" cy="19" r="2" fill="#dc2626"/>
        <circle cx="16" cy="19" r="2" fill="#dc2626"/>
      </svg>
    </div>
    <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">
      HASARU TRADING
    </h1>
    <p style="color: #fee2e2; margin: 5px 0 0 0; font-size: 14px; letter-spacing: 2px;">
      AUTO PARTS & TIRES
    </p>
  </div>
`;

// Email template footer
const getEmailFooter = () => `
  <div style="background: #1a1a1a; color: #9ca3af; padding: 30px 20px; margin-top: 40px;">
    <div style="text-align: center; margin-bottom: 20px;">
      <h3 style="color: #dc2626; margin: 0 0 15px 0; font-size: 18px;">Contact Us</h3>
      <table style="margin: 0 auto; text-align: left;">
        <tr>
          <td style="padding: 5px 10px; font-size: 14px;">
            <span style="color: #dc2626; margin-right: 8px;">✉</span> Email:
          </td>
          <td style="padding: 5px 10px; font-size: 14px;">
            <a href="mailto:info@hasarutrading.com" style="color: #9ca3af; text-decoration: none;">info@hasarutrading.com</a>
          </td>
        </tr>
        <tr>
          <td style="padding: 5px 10px; font-size: 14px;">
            <span style="color: #dc2626; margin-right: 8px;">☎</span> Phone:
          </td>
          <td style="padding: 5px 10px; font-size: 14px;">+94 XX XXX XXXX</td>
        </tr>
        <tr>
          <td style="padding: 5px 10px; font-size: 14px;">
            <span style="color: #dc2626; margin-right: 8px;">⌖</span> Address:
          </td>
          <td style="padding: 5px 10px; font-size: 14px;">Colombo, Sri Lanka</td>
        </tr>
      </table>
    </div>
    <div style="border-top: 1px solid #374151; padding-top: 20px; text-align: center;">
      <p style="margin: 0; font-size: 12px; color: #6b7280;">
        &copy; ${new Date().getFullYear()} Hasaru Trading. All rights reserved.
      </p>
      <p style="margin: 10px 0 0 0; font-size: 12px; color: #6b7280;">
        This is an automated email. Please do not reply to this message.
      </p>
    </div>
  </div>
`;

// Email wrapper
const wrapEmail = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6; }
    .email-container { max-width: 600px; margin: 0 auto; background: white; }
    .content { padding: 40px 30px; }
    @media only screen and (max-width: 600px) {
      .content { padding: 20px 15px; }
    }
  </style>
</head>
<body>
  <div class="email-container">
    ${getEmailHeader()}
    <div class="content">
      ${content}
    </div>
    ${getEmailFooter()}
  </div>
</body>
</html>
`;

class EmailService {
  /**
   * Send low stock alert email to admin
   */
  async sendLowStockAlert(product, alertLevel) {
    try {
      const subject = `[${alertLevel.toUpperCase()}] Low Stock Alert - ${product.name}`;
      
      const content = `
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="display: inline-block; width: 80px; height: 80px; background: ${alertLevel === 'critical' ? '#dc2626' : '#f59e0b'}; border-radius: 50%; text-align: center; line-height: 80px; margin-bottom: 15px;">
            <span style="color: white; font-size: 40px; font-weight: bold;">!</span>
          </div>
          <h2 style="color: ${alertLevel === 'critical' ? '#dc2626' : '#f59e0b'}; margin: 0; font-size: 24px;">
            ${alertLevel === 'critical' ? 'CRITICAL' : 'WARNING'} - Low Stock Alert
          </h2>
        </div>

        <div style="background: linear-gradient(135deg, #fee2e2 0%, #fef3c7 100%); border-left: 4px solid ${alertLevel === 'critical' ? '#dc2626' : '#f59e0b'}; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 15px 0; color: #1a1a1a; font-size: 18px;">Product Information</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 12px 5px; color: #4b5563; font-weight: 600; width: 45%; vertical-align: top;">Product Name:</td>
              <td style="padding: 12px 5px; color: #1f2937; font-weight: bold; vertical-align: top;">${product.name}</td>
            </tr>
            <tr style="background: rgba(255,255,255,0.5);">
              <td style="padding: 12px 5px; color: #4b5563; font-weight: 600; vertical-align: top;">SKU:</td>
              <td style="padding: 12px 5px; color: #1f2937; vertical-align: top;">${product.sku}</td>
            </tr>
            <tr>
              <td style="padding: 12px 5px; color: #4b5563; font-weight: 600; vertical-align: top;">Category:</td>
              <td style="padding: 12px 5px; color: #1f2937; vertical-align: top;">${product.category || 'N/A'}</td>
            </tr>
            <tr style="background: rgba(255,255,255,0.5);">
              <td style="padding: 12px 5px; color: #4b5563; font-weight: 600; vertical-align: top;">Current Stock:</td>
              <td style="padding: 12px 5px; vertical-align: top;">
                <span style="color: #dc2626; font-weight: bold; font-size: 18px; background: white; padding: 5px 15px; border-radius: 4px; display: inline-block;">
                  ${product.stock_quantity} units
                </span>
              </td>
            </tr>
            <tr>
              <td style="padding: 12px 5px; color: #4b5563; font-weight: 600; vertical-align: top;">Reorder Level:</td>
              <td style="padding: 12px 5px; color: #1f2937; vertical-align: top;">${product.reorder_level} units</td>
            </tr>
            <tr style="background: rgba(255,255,255,0.5);">
              <td style="padding: 12px 5px; color: #4b5563; font-weight: 600; vertical-align: top;">Minimum Level:</td>
              <td style="padding: 12px 5px; color: #1f2937; vertical-align: top;">${product.minimum_stock_level} units</td>
            </tr>
          </table>
        </div>

        <div style="background: ${alertLevel === 'critical' ? '#fee2e2' : '#fef3c7'}; border: 2px dashed ${alertLevel === 'critical' ? '#dc2626' : '#f59e0b'}; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <p style="margin: 0; color: #1f2937; font-weight: bold; font-size: 16px;">
            <span style="color: ${alertLevel === 'critical' ? '#dc2626' : '#f59e0b'};">⚠</span> ACTION REQUIRED
          </p>
          <p style="margin: 10px 0 0 0; color: #4b5563;">
            ${alertLevel === 'critical' 
              ? 'URGENT: Stock is at or below minimum level. Immediate reorder required!' 
              : 'Stock is below reorder level. Please consider placing a purchase order soon.'}
          </p>
        </div>

        <p style="color: #6b7280; font-size: 13px; text-align: center; margin-top: 30px;">
          Alert generated: ${new Date().toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })}
        </p>
      `;

      const html = wrapEmail(content);

      const mailOptions = {
        from: `"Hasaru Trading System" <${process.env.EMAIL_USER}>`,
        to: process.env.ADMIN_EMAIL,
        subject,
        html
      };

      await transporter.sendMail(mailOptions);
      logger.info(`Low stock alert email sent for product: ${product.name}`);
      
      return true;
    } catch (error) {
      logger.error(`Failed to send low stock alert email: ${error.message}`);
      return false;
    }
  }

  /**
   * Send order confirmation email to customer
   */
  async sendOrderConfirmation(order, customer) {
    try {
      const subject = `Order Confirmed - ${order.order_number}`;
      
      const content = `
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="display: inline-block; width: 80px; height: 80px; background: #10b981; border-radius: 50%; text-align: center; line-height: 80px; margin-bottom: 15px;">
            <span style="color: white; font-size: 40px; font-weight: bold;">✓</span>
          </div>
          <h2 style="color: #10b981; margin: 0; font-size: 26px;">Order Confirmed!</h2>
          <p style="color: #6b7280; margin: 10px 0 0 0;">Thank you for your purchase</p>
        </div>

        <p style="font-size: 16px; color: #1f2937; line-height: 1.6;">
          Dear <strong>${customer.name}</strong>,
        </p>
        <p style="color: #4b5563; line-height: 1.6;">
          We're excited to confirm that we've received your order! Our team is now processing it with care.
        </p>

        <div style="background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%); border-left: 4px solid #dc2626; padding: 25px; border-radius: 8px; margin: 25px 0;">
          <h3 style="margin: 0 0 20px 0; color: #1a1a1a; font-size: 18px; border-bottom: 2px solid #dc2626; padding-bottom: 10px;">
            Order Summary
          </h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 12px 5px; color: #4b5563; font-weight: 600; width: 45%; vertical-align: top;">Order Number:</td>
              <td style="padding: 12px 5px; vertical-align: top;">
                <span style="background: #dc2626; color: white; padding: 6px 15px; border-radius: 4px; font-weight: bold; font-size: 14px; display: inline-block;">
                  ${order.order_number}
                </span>
              </td>
            </tr>
            <tr style="background: rgba(255,255,255,0.5);">
              <td style="padding: 12px 5px; color: #4b5563; font-weight: 600; vertical-align: top;">Order Date:</td>
              <td style="padding: 12px 5px; color: #1f2937; font-weight: 500; vertical-align: top;">
                ${new Date(order.order_date).toLocaleDateString('en-US', { dateStyle: 'full' })}
              </td>
            </tr>
            <tr>
              <td style="padding: 12px 5px; color: #4b5563; font-weight: 600; vertical-align: top;">Total Amount:</td>
              <td style="padding: 12px 5px; vertical-align: top;">
                <span style="color: #dc2626; font-weight: bold; font-size: 20px;">
                  Rs. ${parseFloat(order.total_amount).toFixed(2)}
                </span>
              </td>
            </tr>
            <tr style="background: rgba(255,255,255,0.5);">
              <td style="padding: 12px 5px; color: #4b5563; font-weight: 600; vertical-align: top;">Status:</td>
              <td style="padding: 12px 5px; vertical-align: top;">
                <span style="background: #10b981; color: white; padding: 4px 12px; border-radius: 12px; font-size: 13px; text-transform: uppercase; display: inline-block;">
                  ${order.status}
                </span>
              </td>
            </tr>
          </table>
        </div>

        <div style="background: #1a1a1a; color: white; padding: 20px; border-radius: 8px; border: 2px solid #dc2626; margin: 25px 0;">
          <h4 style="margin: 0 0 10px 0; color: #dc2626; font-size: 16px;">
            <span style="margin-right: 8px;">⌖</span>Delivery Address
          </h4>
          <p style="margin: 0; color: #e5e7eb; line-height: 1.8; font-size: 15px;">
            ${order.shipping_address}
          </p>
        </div>

        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; margin: 25px 0;">
          <p style="margin: 0 0 10px 0; color: #1f2937; font-size: 15px;">
            <strong>What's Next?</strong>
          </p>
          <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
            You'll receive another email when your order is shipped with tracking information.
          </p>
        </div>

        <p style="color: #4b5563; line-height: 1.6; margin-top: 30px;">
          If you have any questions about your order, feel free to contact us.
        </p>
        <p style="color: #1f2937; font-weight: 600; margin-top: 20px;">
          Best regards,<br>
          <span style="color: #dc2626;">Hasaru Trading Team</span>
        </p>
      `;

      const html = wrapEmail(content);

      const mailOptions = {
        from: `"Hasaru Trading" <${process.env.EMAIL_USER}>`,
        to: customer.email,
        subject,
        html
      };

      await transporter.sendMail(mailOptions);
      logger.info(`Order confirmation email sent to: ${customer.email}`);
      
      return true;
    } catch (error) {
      logger.error(`Failed to send order confirmation email: ${error.message}`);
      return false;
    }
  }

  /**
   * Send welcome email to new user
   */
  async sendWelcomeEmail(user) {
    try {
      const subject = 'Welcome to Hasaru Trading';
      
      const content = `
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="display: inline-block; width: 80px; height: 80px; background: #dc2626; border-radius: 50%; text-align: center; line-height: 80px; margin-bottom: 15px;">
            <span style="color: white; font-size: 40px;">★</span>
          </div>
          <h2 style="color: #dc2626; margin: 0; font-size: 26px;">Welcome Aboard!</h2>
          <p style="color: #6b7280; margin: 10px 0 0 0;">Your journey with us begins now</p>
        </div>

        <p style="font-size: 16px; color: #1f2937; line-height: 1.6;">
          Dear <strong>${user.name}</strong>,
        </p>
        <p style="color: #4b5563; line-height: 1.6;">
          Thank you for registering with <strong style="color: #dc2626;">Hasaru Trading</strong>! 
          We're thrilled to have you as part of our community.
        </p>

        <div style="background: linear-gradient(135deg, #1a1a1a 0%, #dc2626 100%); padding: 30px; border-radius: 12px; margin: 25px 0; text-align: center;">
          <h3 style="margin: 0 0 20px 0; color: white; font-size: 20px;">
            <span style="color: #10b981; margin-right: 8px;">✓</span> Account Successfully Created
          </h3>
          <div style="background: rgba(255,255,255,0.1); border: 2px solid rgba(255,255,255,0.3); padding: 20px; border-radius: 8px; backdrop-filter: blur(10px);">
            <table style="width: 100%; max-width: 400px; margin: 0 auto; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 5px; text-align: left; color: #fee2e2; font-weight: 600; vertical-align: top;">Email:</td>
                <td style="padding: 10px 5px; text-align: right; color: white; font-weight: bold; vertical-align: top; word-break: break-all;">${user.email}</td>
              </tr>
              <tr>
                <td style="padding: 10px 5px; text-align: left; color: #fee2e2; font-weight: 600; vertical-align: top;">Role:</td>
                <td style="padding: 10px 5px; text-align: right; vertical-align: top;">
                  <span style="background: #dc2626; color: white; padding: 4px 12px; border-radius: 12px; font-size: 13px; text-transform: uppercase; font-weight: bold; display: inline-block;">
                    ${user.role}
                  </span>
                </td>
              </tr>
            </table>
          </div>
        </div>

        <div style="background: #f3f4f6; border-left: 4px solid #dc2626; padding: 20px; border-radius: 8px; margin: 25px 0;">
          <h4 style="margin: 0 0 15px 0; color: #1a1a1a; font-size: 16px;">
            <span style="color: #dc2626; margin-right: 8px;">►</span>What You Can Do Now:
          </h4>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #4b5563; vertical-align: top; width: 20px;">
                <span style="color: #dc2626;">•</span>
              </td>
              <td style="padding: 8px 0; color: #4b5563; line-height: 1.6;">
                Browse our extensive collection of quality tires and auto parts
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #4b5563; vertical-align: top;">
                <span style="color: #dc2626;">•</span>
              </td>
              <td style="padding: 8px 0; color: #4b5563; line-height: 1.6;">
                Enjoy exclusive deals and promotions
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #4b5563; vertical-align: top;">
                <span style="color: #dc2626;">•</span>
              </td>
              <td style="padding: 8px 0; color: #4b5563; line-height: 1.6;">
                Track your orders in real-time
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #4b5563; vertical-align: top;">
                <span style="color: #dc2626;">•</span>
              </td>
              <td style="padding: 8px 0; color: #4b5563; line-height: 1.6;">
                Manage your account and preferences
              </td>
            </tr>
          </table>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="http://localhost:5173/products" style="background: #dc2626; color: white; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-weight: bold; display: inline-block; box-shadow: 0 4px 6px rgba(220, 38, 38, 0.3);">
            Start Shopping Now →
          </a>
        </div>

        <p style="color: #4b5563; line-height: 1.6; margin-top: 30px; text-align: center;">
          Need help? Our support team is always here for you.
        </p>
        <p style="color: #1f2937; font-weight: 600; margin-top: 20px; text-align: center;">
          Welcome to the family!<br>
          <span style="color: #dc2626;">Hasaru Trading Team</span>
        </p>
      `;

      const html = wrapEmail(content);

      const mailOptions = {
        from: `"Hasaru Trading" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject,
        html
      };

      await transporter.sendMail(mailOptions);
      logger.info(`Welcome email sent to: ${user.email}`);
      
      return true;
    } catch (error) {
      logger.error(`Failed to send welcome email: ${error.message}`);
      return false;
    }
  }

  /**
   * Send order status update email to customer
   */
  async sendOrderStatusUpdate(order, customer, oldStatus, newStatus) {
    try {
      const statusConfig = {
        processing: {
          icon: '<div style="display: inline-block; width: 80px; height: 80px; background: #3b82f6; border-radius: 50%; text-align: center; line-height: 80px;"><span style="color: white; font-size: 36px; font-weight: bold;">⟳</span></div>',
          color: '#3b82f6',
          bgGradient: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
          title: 'Order is Being Processed',
          message: 'Great news! Your order is now being processed. Our team is carefully preparing your items for shipment.',
          action: 'We\'ll notify you once your order is shipped.'
        },
        shipped: {
          icon: '<div style="display: inline-block; width: 80px; height: 80px; background: #10b981; border-radius: 50%; text-align: center; line-height: 80px;"><span style="color: white; font-size: 36px; font-weight: bold;">▶</span></div>',
          color: '#10b981',
          bgGradient: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
          title: 'Order Shipped!',
          message: 'Exciting news! Your order has been shipped and is on its way to you.',
          action: 'Track your delivery and expect it soon!'
        },
        completed: {
          icon: '<div style="display: inline-block; width: 80px; height: 80px; background: #10b981; border-radius: 50%; text-align: center; line-height: 80px;"><span style="color: white; font-size: 40px; font-weight: bold;">✓</span></div>',
          color: '#10b981',
          bgGradient: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
          title: 'Order Delivered',
          message: 'Your order has been successfully delivered. We hope you love your purchase!',
          action: 'Thank you for choosing Hasaru Trading!'
        },
        cancelled: {
          icon: '<div style="display: inline-block; width: 80px; height: 80px; background: #dc2626; border-radius: 50%; text-align: center; line-height: 80px;"><span style="color: white; font-size: 40px; font-weight: bold;">✕</span></div>',
          color: '#dc2626',
          bgGradient: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
          title: 'Order Cancelled',
          message: 'Your order has been cancelled as requested.',
          action: 'If you have any questions or concerns, please don\'t hesitate to contact us.'
        },
        returned: {
          icon: '<div style="display: inline-block; width: 80px; height: 80px; background: #f59e0b; border-radius: 50%; text-align: center; line-height: 80px;"><span style="color: white; font-size: 36px; font-weight: bold;">↶</span></div>',
          color: '#f59e0b',
          bgGradient: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
          title: 'Return Processed',
          message: 'Your return request has been processed successfully.',
          action: 'Refund will be initiated within 3-5 business days.'
        }
      };

      const config = statusConfig[newStatus] || {
        icon: '<div style="display: inline-block; width: 80px; height: 80px; background: #6b7280; border-radius: 50%; text-align: center; line-height: 80px;"><span style="color: white; font-size: 36px;">■</span></div>',
        color: '#6b7280',
        bgGradient: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
        title: 'Order Status Updated',
        message: `Your order status has been updated.`,
        action: 'Check your order details for more information.'
      };

      const subject = `Order Update: ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)} - ${order.order_number || `ONL-${String(order.id).padStart(6, '0')}`}`;
      
      const content = `
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="margin-bottom: 15px;">${config.icon}</div>
          <h2 style="color: ${config.color}; margin: 0; font-size: 26px; font-weight: bold;">
            ${config.title}
          </h2>
        </div>

        <p style="font-size: 16px; color: #1f2937; line-height: 1.6;">
          Dear <strong>${customer.name}</strong>,
        </p>
        <p style="color: #4b5563; line-height: 1.8; font-size: 15px;">
          ${config.message}
        </p>

        <div style="background: ${config.bgGradient}; border: 2px solid ${config.color}; padding: 25px; border-radius: 12px; margin: 25px 0;">
          <h3 style="margin: 0 0 20px 0; color: #1a1a1a; font-size: 18px; border-bottom: 2px solid ${config.color}; padding-bottom: 10px;">
            <span style="color: ${config.color}; margin-right: 8px;">■</span> Order Information
          </h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 12px 5px; color: #4b5563; font-weight: 600; width: 45%; vertical-align: top;">Order Number:</td>
              <td style="padding: 12px 5px; vertical-align: top;">
                <span style="background: ${config.color}; color: white; padding: 6px 15px; border-radius: 4px; font-weight: bold; font-size: 14px; display: inline-block;">
                  ${order.order_number || `ONL-${String(order.id).padStart(6, '0')}`}
                </span>
              </td>
            </tr>
            <tr style="background: rgba(255,255,255,0.5);">
              <td style="padding: 12px 5px; color: #4b5563; font-weight: 600; vertical-align: top;">Order Date:</td>
              <td style="padding: 12px 5px; color: #1f2937; font-weight: 500; vertical-align: top;">
                ${new Date(order.sale_date || order.created_at).toLocaleDateString('en-US', { dateStyle: 'full' })}
              </td>
            </tr>
            <tr>
              <td style="padding: 12px 5px; color: #4b5563; font-weight: 600; vertical-align: top;">Total Amount:</td>
              <td style="padding: 12px 5px; vertical-align: top;">
                <span style="color: #dc2626; font-weight: bold; font-size: 18px;">
                  Rs. ${parseFloat(order.total_amount).toFixed(2)}
                </span>
              </td>
            </tr>
          </table>

          <div style="background: white; margin-top: 20px; padding: 15px; border-radius: 8px; border-left: 4px solid ${config.color};">
            <h4 style="margin: 0 0 10px 0; color: #1a1a1a; font-size: 15px;">Status Timeline:</h4>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="text-align: center; vertical-align: middle;">
                  <span style="background: #e5e7eb; color: #6b7280; padding: 6px 12px; border-radius: 12px; font-size: 13px; text-transform: uppercase; font-weight: 600; display: inline-block;">
                    ${oldStatus}
                  </span>
                </td>
                <td style="text-align: center; vertical-align: middle; width: 50px;">
                  <span style="color: #6b7280; font-size: 20px;">→</span>
                </td>
                <td style="text-align: center; vertical-align: middle;">
                  <span style="background: ${config.color}; color: white; padding: 6px 12px; border-radius: 12px; font-size: 13px; text-transform: uppercase; font-weight: 600; display: inline-block;">
                    ${newStatus}
                  </span>
                </td>
              </tr>
            </table>
          </div>
        </div>

        ${newStatus === 'shipped' ? `
        <div style="background: #1a1a1a; color: white; padding: 20px; border-radius: 8px; border: 2px solid #10b981; margin: 25px 0;">
          <h4 style="margin: 0 0 10px 0; color: #10b981; font-size: 16px;"><span style="margin-right: 8px;">⌖</span> Delivery Address</h4>
          <p style="margin: 0; color: #e5e7eb; line-height: 1.8; font-size: 15px;">
            ${order.notes ? order.notes.split('Shipping Address:')[1]?.split('\n')[0]?.trim() || 'N/A' : 'N/A'}
          </p>
        </div>
        ` : ''}

        ${newStatus === 'completed' ? `
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 25px; border-radius: 12px; text-align: center; margin: 25px 0; color: white;">
          <h3 style="margin: 0 0 10px 0; font-size: 20px;"><span style="font-size: 24px; margin-right: 8px;">★</span> Thank You!</h3>
          <p style="margin: 0; font-size: 15px; opacity: 0.9;">
            We hope you're satisfied with your purchase. Your feedback helps us improve!
          </p>
        </div>
        ` : ''}

        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; margin: 25px 0;">
          <p style="margin: 0; color: #1f2937; font-size: 15px; font-weight: 600;">
            ${config.action}
          </p>
        </div>

        <p style="color: #4b5563; line-height: 1.6; margin-top: 30px;">
          If you have any questions or need assistance, our support team is here to help.
        </p>
        <p style="color: #1f2937; font-weight: 600; margin-top: 20px;">
          Best regards,<br>
          <span style="color: #dc2626;">Hasaru Trading Team</span>
        </p>
      `;

      const html = wrapEmail(content);

      const mailOptions = {
        from: `"Hasaru Trading" <${process.env.EMAIL_USER}>`,
        to: customer.email,
        subject,
        html
      };

      await transporter.sendMail(mailOptions);
      logger.info(`Order status update email sent to: ${customer.email} (${oldStatus} → ${newStatus})`);
      
      return true;
    } catch (error) {
      logger.error(`Failed to send order status update email: ${error.message}`);
      return false;
    }
  }
}

module.exports = new EmailService();
