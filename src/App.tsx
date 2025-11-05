import { useState, useEffect } from "react";
import "./assets/App.css";

type Producto = {
  id: number;
  nombre: string;
  cantidad: number;
  detalles: string;
};

export default function App() {
  const [productos, setProductos] = useState<Producto[]>(() => {
    const data = localStorage.getItem("stock");
    return data ? JSON.parse(data) : [];
  });

  const [nombre, setNombre] = useState("");
  const [detalles, setDetalles] = useState("");
  const [cantidad, setCantidad] = useState(0);

  const [editando, setEditando] = useState<number | null>(null);
  const [editandoProducto, setEditandoProducto] = useState<Producto | null>(
    null
  );

  useEffect(() => {
    localStorage.setItem("stock", JSON.stringify(productos));
  }, [productos]);

  const agregarProducto = () => {
    if (!nombre) return;
    setProductos([
      ...productos,
      { id: Date.now(), nombre, cantidad, detalles },
    ]);
    setNombre("");
    setDetalles("");
    setCantidad(0);
  };

  const cambiarCantidad = (id: number, delta: number) => {
    setProductos(
      productos.map((p) =>
        p.id === id ? { ...p, cantidad: Math.max(0, p.cantidad + delta) } : p
      )
    );
  };

  const eliminarProducto = (id: number) => {
    setProductos(productos.filter((p) => p.id !== id));
  };

  const iniciarEdicion = (producto: Producto) => {
    setEditando(producto.id);
    setEditandoProducto({ ...producto });
  };

  const guardarEdicion = () => {
    if (!editandoProducto) return;
    setProductos(
      productos.map((p) =>
        p.id === editandoProducto.id ? editandoProducto : p
      )
    );
    setEditando(null);
    setEditandoProducto(null);
  };

  const cancelarEdicion = () => {
    setEditando(null);
    setEditandoProducto(null);
  };

  const getEstado = (cantidad: number) => {
    if (cantidad === 0) return "sin-stock";
    if (cantidad < 5) return "bajo-stock";
    return "disponible";
  };

  const sinStock = productos.filter((p) => p.cantidad === 0);

  return (
    <div className="app-container">
      <div className="app">
        <h1>📦 Control de Stock</h1>

        <form
          className="formulario"
          onSubmit={(e) => {
            e.preventDefault();
            agregarProducto();
          }}
        >
          <input
            placeholder="Producto"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
          <input
            placeholder="Detalles"
            value={detalles}
            onChange={(e) => setDetalles(e.target.value)}
          />
          <input
            type="number"
            value={cantidad}
            onChange={(e) => setCantidad(Number(e.target.value))}
          />
          <button type="submit">➕ Agregar</button>
        </form>

        {/* Tabla de stock */}
        <table>
          <thead>
            <tr>
              <th>Producto</th>
              <th>Detalles</th>
              <th>Cantidad</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productos.map((p) => (
              <tr key={p.id}>
                {editando === p.id && editandoProducto ? (
                  <>
                    <td>
                      <input
                        value={editandoProducto.nombre}
                        onChange={(e) =>
                          setEditandoProducto({
                            ...editandoProducto,
                            nombre: e.target.value,
                          })
                        }
                      />
                    </td>
                    <td>
                      <input
                        value={editandoProducto.detalles}
                        onChange={(e) =>
                          setEditandoProducto({
                            ...editandoProducto,
                            detalles: e.target.value,
                          })
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={editandoProducto.cantidad}
                        onChange={(e) =>
                          setEditandoProducto({
                            ...editandoProducto,
                            cantidad: Number(e.target.value),
                          })
                        }
                      />
                    </td>
                    <td
                      className={`estado ${getEstado(
                        editandoProducto.cantidad
                      )}`}
                    >
                      {editandoProducto.cantidad === 0
                        ? "Sin stock"
                        : editandoProducto.cantidad < 5
                        ? "Stock bajo"
                        : "Disponible"}
                    </td>
                    <td>
                      <button className="guardar" onClick={guardarEdicion}>
                        ✅ Guardar
                      </button>
                      <button className="eliminar" onClick={cancelarEdicion}>
                        ❌ Cancelar
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td>{p.nombre}</td>
                    <td>{p.detalles}</td>
                    <td className="cantidad">
                      <button onClick={() => cambiarCantidad(p.id, -1)}>
                        ➖
                      </button>
                      <span>{p.cantidad}</span>
                      <button onClick={() => cambiarCantidad(p.id, 1)}>
                        ➕
                      </button>
                    </td>
                    <td className={`estado ${getEstado(p.cantidad)}`}>
                      {p.cantidad === 0
                        ? "Sin stock"
                        : p.cantidad < 5
                        ? "Stock bajo"
                        : "Disponible"}
                    </td>
                    <td>
                      <button
                        className="editar"
                        onClick={() => iniciarEdicion(p)}
                      >
                        ✏️ Editar
                      </button>
                      <button
                        className="eliminar"
                        onClick={() => eliminarProducto(p.id)}
                      >
                        🗑️ Eliminar
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Columna lateral con productos sin stock */}
      <aside className="sin-stock-panel">
        <h2>🚫 Sin stock</h2>
        {sinStock.length === 0 ? (
          <p>Todo con stock ✅</p>
        ) : (
          <ul>
            {sinStock.map((p) => (
              <li key={p.id}>{p.nombre}</li>
            ))}
          </ul>
        )}
      </aside>
    </div>
  );
}
