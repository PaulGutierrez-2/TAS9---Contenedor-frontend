import { useEffect, useState } from "react";
import type { Producto } from "./types";

export default function App() {
  const [productos, setProductos] = useState<Producto[]>([]);

  useEffect(() => {
    fetch("http://localhost:3001/productos")
      .then((res) => res.json())
      .then((data) => setProductos(data))
      .catch((err) => console.error("Error cargando productos:", err));
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Inventario de Productos (React + TypeScript)</h1>

      <table border={1} cellPadding={10}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Precio ($)</th>
            <th>Stock</th>
          </tr>
        </thead>

        <tbody>
          {productos.map((p) => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.nombre}</td>
              <td>{p.precio}</td>
              <td>{p.stock}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
