
"use client";

import { useEffect, useState } from "react";

interface Product {
  id: number;
  name: string;
  price: string;
  sku: string;
  stock_status: string;
  images: { src: string; alt: string }[];
  categories: { id: number; name: string }[];
}

export default function WooProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState("");


useEffect(() => {
  async function loadProducts() {
    try {
      const response = await fetch("/api/woo/products");
      const body = await response.text();

      console.log("API status:", response.status);
      console.log("API response:", body);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${body}`);
      }

      setProducts(JSON.parse(body));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unknown error"
      );
    }
  }

  loadProducts();
}, []);


  if (error) return <p>Error: {error}</p>;

  return (
    <main style={{ padding: 24 }}>
      <h1>WooCommerce Products</h1>

      {products.length === 0 && <p>Loading products...</p>}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: 20,
        }}
      >
        {products.map((product) => (
          <article
            key={product.id}
            style={{ border: "1px solid #ddd", padding: 16, borderRadius: 8 }}
          >
            {product.images[0] && (
              <img
                src={product.images[0].src}
                alt={product.images[0].alt || product.name}
                style={{ width: "100%", height: 180, objectFit: "cover" }}
              />
            )}

            <h2>{product.name}</h2>
            <p>Product ID: {product.id}</p>
            <p>Price: ${product.price || "0.00"}</p>
            <p>SKU: {product.sku || "Not set"}</p>
            <p>Stock: {product.stock_status}</p>
            <p>
              Category:{" "}
              {product.categories.map((category) => category.name).join(", ")}
            </p>
          </article>
        ))}
      </div>
    </main>
  );
}
