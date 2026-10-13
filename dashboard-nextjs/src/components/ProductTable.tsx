import type { Product, ProductStatus } from '@/schemas/product';

const LABELS: Record<ProductStatus, string> = {
  active: 'Active',
  inactive: 'Inactive',
  out_of_stock: 'Out of stock',
};

const priceFormat = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
const dateFormat = new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium' });

export function ProductTable({ products }: { products: Product[] }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th scope="col">Name</th>
            <th scope="col">Status</th>
            <th scope="col" className="num">
              Price
            </th>
            <th scope="col">Created</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td>{p.name}</td>
              <td>
                <span className={`badge ${p.status}`}>{LABELS[p.status]}</span>
              </td>
              <td className="num">{priceFormat.format(p.price)}</td>
              <td>{dateFormat.format(new Date(p.createdAt))}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
