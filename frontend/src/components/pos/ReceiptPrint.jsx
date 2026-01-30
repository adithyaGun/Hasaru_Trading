import { Divider, Typography } from 'antd';
import './ReceiptPrint.css';

const { Text } = Typography;

const ReceiptPrint = ({ saleData }) => {
  if (!saleData) return null;

  const {
    sale_id,
    customer_name,
    customer_phone,
    payment_method,
    items,
    subtotal,
    discount,
    total,
    sale_date
  } = saleData;

  return (
    <div className="receipt-container receipt-print-content" id="receipt-print">
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            #receipt-print, #receipt-print * {
              visibility: visible;
            }
            #receipt-print {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
            .ant-modal, .ant-modal-mask {
              display: none !important;
            }
          }
        `}
      </style>

      <div className="receipt-header">
        <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>
          HASARU TRADING
        </h2>
        <p style={{ margin: '4px 0', fontSize: '14px' }}>
          Tire & Auto Parts Shop
        </p>
        <p style={{ margin: '2px 0', fontSize: '12px' }}>
          123 Main Street, Colombo, Sri Lanka
        </p>
        <p style={{ margin: '2px 0', fontSize: '12px' }}>
          Tel: +94 11 234 5678
        </p>
      </div>

      <Divider style={{ margin: '12px 0', borderColor: '#000' }} />

      <div className="receipt-info">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <Text strong>Receipt #:</Text>
          <Text>{sale_id}</Text>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <Text strong>Date:</Text>
          <Text>{sale_date}</Text>
        </div>
        {customer_name && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <Text strong>Customer:</Text>
            <Text>{customer_name}</Text>
          </div>
        )}
        {customer_phone && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <Text strong>Phone:</Text>
            <Text>{customer_phone}</Text>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <Text strong>Payment:</Text>
          <Text style={{ textTransform: 'capitalize' }}>{payment_method}</Text>
        </div>
      </div>

      <Divider style={{ margin: '12px 0', borderColor: '#000' }} />

      <div className="receipt-items">
        <table style={{ width: '100%', fontSize: '12px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #000' }}>
              <th style={{ textAlign: 'left', padding: '4px 0' }}>Item</th>
              <th style={{ textAlign: 'center', padding: '4px 0' }}>Qty</th>
              <th style={{ textAlign: 'right', padding: '4px 0' }}>Price</th>
              <th style={{ textAlign: 'right', padding: '4px 0' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index} style={{ borderBottom: '1px dashed #ccc' }}>
                <td style={{ padding: '8px 0' }}>
                  <div>{item.name}</div>
                  <div style={{ fontSize: '10px', color: '#666' }}>{item.sku}</div>
                </td>
                <td style={{ textAlign: 'center', padding: '8px 0' }}>{item.quantity}</td>
                <td style={{ textAlign: 'right', padding: '8px 0' }}>
                  Rs. {item.price.toFixed(2)}
                </td>
                <td style={{ textAlign: 'right', padding: '8px 0' }}>
                  Rs. {(item.price * item.quantity).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Divider style={{ margin: '12px 0', borderColor: '#000' }} />

      <div className="receipt-totals">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
          <Text>Subtotal:</Text>
          <Text>Rs. {subtotal.toFixed(2)}</Text>
        </div>
        {discount > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <Text>Discount:</Text>
            <Text style={{ color: '#dc2626' }}>- Rs. {discount.toFixed(2)}</Text>
          </div>
        )}
        <Divider style={{ margin: '8px 0', borderColor: '#000' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <Text strong style={{ fontSize: '16px' }}>TOTAL:</Text>
          <Text strong style={{ fontSize: '18px', color: '#dc2626' }}>
            Rs. {total.toFixed(2)}
          </Text>
        </div>
      </div>

      <Divider style={{ margin: '12px 0', borderColor: '#000' }} />

      <div className="receipt-footer" style={{ textAlign: 'center' }}>
        <p style={{ margin: '8px 0', fontSize: '12px', fontWeight: 'bold' }}>
          Thank you for your purchase!
        </p>
        <p style={{ margin: '4px 0', fontSize: '10px', color: '#666' }}>
          Goods once sold cannot be returned or exchanged
        </p>
        <p style={{ margin: '4px 0', fontSize: '10px', color: '#666' }}>
          For inquiries, please contact us at the above number
        </p>
        <div style={{ marginTop: '16px', fontSize: '10px', color: '#666' }}>
          <p style={{ margin: '2px 0' }}>Powered by Hasaru Trading POS System</p>
          <p style={{ margin: '2px 0' }}>www.hasarutrading.lk</p>
        </div>
      </div>
    </div>
  );
};

export default ReceiptPrint;
