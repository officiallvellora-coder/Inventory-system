export default function InventoryTable({ data }) {
  if (!data || data.length === 0) {
    return <p>No inventory found</p>;
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Product</th>
          <th>SKU</th>
          <th>Batch</th>
          <th>Expiry</th>
          <th>Holder</th>
          <th>Role</th>
          <th>Qty</th>
        </tr>
      </thead>
      <tbody>
        {data.map(row => (
          <tr key={row.productId}>
            <td>{row.name}</td>
            <td>{row.sku}</td>
            <td>{row.batchNumber}</td>
            <td>{row.expiryDate}</td>
            <td>{row.holder || 'Admin'}</td>
            <td>{row.role || 'admin'}</td>
            <td>{row.quantity}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
