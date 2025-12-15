import { useEffect, useState } from "react";
import type { Product } from "./types";

// En producción, usar el proxy de nginx. En desarrollo, usar la variable de entorno o localhost
const API_URL = import.meta.env.PROD 
  ? "/api" 
  : (import.meta.env.VITE_API_URL || "http://localhost:3000");

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/products`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Error ${res.status}: ${res.statusText}`);
        }
        return res.json();
      })
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error cargando productos:", err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div style={{ padding: "20px" }}>
        <h1>Inventario de Productos</h1>
        <p>Cargando productos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "20px" }}>
        <h1>Inventario de Productos</h1>
        <p style={{ color: "red" }}>Error: {error}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Inventario de Productos</h1>

      {products.length === 0 ? (
        <p>No hay productos disponibles.</p>
      ) : (
        <table border={1} cellPadding={10} style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Precio ($)</th>
              <th>Stock</th>
            </tr>
          </thead>

          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.name}</td>
                <td>{p.description || "-"}</td>
                <td>${p.price.toFixed(2)}</td>
                <td>{p.stock}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
