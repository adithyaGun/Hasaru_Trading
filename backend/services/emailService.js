const { transporter } = require('../config/email');
const logger = require('../utils/logger');

class EmailService {
  /**
   * Send low stock alert email to admin
   */
  async sendLowStockAlert(product, alertLevel) {
    try {
      const subject = `[${alertLevel.toUpperCase()}] Low Stock Alert - ${product.name}`;
      
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: ${alertLevel === 'critical' ? '#dc2626' : '#f59e0b'};">
            ${alertLevel === 'critical' ? '🔴' : '⚠️'} Low Stock Alert
          </h2>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Product Details</h3>
            <table style="width: 100%;">
              <tr>
                <td style="padding: 8px 0;"><strong>Product Name:</strong></td>
                <td>${product.name}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0;"><strong>SKU:</strong></td>
                <td>${product.sku}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0;"><strong>Category:</strong></td>
                <td>${product.category || 'N/A'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0;"><strong>Current Stock:</strong></td>
                <td style="color: #dc2626; font-weight: bold;">${product.stock_quantity}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0;"><strong>Reorder Level:</strong></td>
                <td>${product.reorder_level}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0;"><strong>Minimum Level:</strong></td>
                <td>${product.minimum_stock_level}</td>
              </tr>
            </table>
          </div>

          <div style="background-color: ${alertLevel === 'critical' ? '#fee2e2' : '#fef3c7'}; 
                      padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0;">
              <strong>Action Required:</strong> 
              ${alertLevel === 'critical' 
                ? 'URGENT - Stock is at or below minimum level. Please reorder immediately.'
                : 'Stock is below reorder level. Please consider placing a purchase order.'}
            </p>
          </div>

          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            This is an automated alert from Hasaru Trading Management System.<br>
            Generated on: ${new Date().toLocaleString()}
          </p>
        </div>
      `;

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
      const subject = `Order Confirmation - ${order.order_number}`;
      
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #10b981;">✅ Order Confirmed!</h2>
          
          <p>Dear ${customer.name},</p>
          <p>Thank you for your order. Your order has been received and is being processed.</p>

          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Order Details</h3>
            <p><strong>Order Number:</strong> ${order.order_number}</p>
            <p><strong>Order Date:</strong> ${new Date(order.order_date).toLocaleDateString()}</p>
            <p><strong>Total Amount:</strong> Rs. ${parseFloat(order.total_amount).toFixed(2)}</p>
            <p><strong>Status:</strong> ${order.status}</p>
          </div>

          <div style="background-color: #dbeafe; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0;">
              <strong>Shipping Address:</strong><br>
              ${order.shipping_address}
            </p>
          </div>

          <p>You will receive another email when your order is shipped.</p>

          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            Best regards,<br>
            Hasaru Trading Team
          </p>
        </div>
      `;

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
      
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3b82f6;">Welcome to Hasaru Trading! 🎉</h2>
          
          <p>Dear ${user.name},</p>
          <p>Thank you for registering with Hasaru Trading. Your account has been successfully created.</p>

          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Account Details</h3>
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>Role:</strong> ${user.role}</p>
          </div>

          <p>You can now log in and start shopping for quality tires and auto parts.</p>

          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            Best regards,<br>
            Hasaru Trading Team
          </p>
        </div>
      `;

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
}

module.exports = new EmailService();
