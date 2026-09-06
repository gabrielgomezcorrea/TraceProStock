import { FormEvent, useMemo, useState } from 'react';
import {
  IonAlert,
  IonApp,
  IonBadge,
  IonButton,
  IonCard,
  IonCardContent,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonModal,
  IonNote,
  IonPage,
  IonSearchbar,
  IonSelect,
  IonSelectOption,
  IonToast,
  IonToggle,
  IonToolbar,
} from '@ionic/react';
import {
  addCircleOutline,
  alertCircleOutline,
  barChartOutline,
  cubeOutline,
  createOutline,
  enterOutline,
  exitOutline,
  homeOutline,
  logOutOutline,
  menuOutline,
  fileTrayStackedOutline,
  removeCircleOutline,
  swapHorizontalOutline,
  trashOutline,
} from 'ionicons/icons';

type Role = 'admin' | 'operario';
type View = 'inicio' | 'productos' | 'movimientos' | 'alertas';
type MovementType = 'entrada' | 'salida';

interface Product {
  id: number;
  sku: string;
  name: string;
  description: string;
  category: string;
  quantity: number;
  minimumStock: number;
  unitPrice: number;
  active: boolean;
}

interface Movement {
  id: number;
  productId: number;
  productName: string;
  type: MovementType;
  quantity: number;
  date: string;
  user: string;
}

const initialProducts: Product[] = [
  { id: 1, sku: 'ALM-001', name: 'Arroz grado 2', description: 'Formato de 1 kg', category: 'Alimentos', quantity: 18, minimumStock: 10, unitPrice: 1490, active: true },
  { id: 2, sku: 'ASE-014', name: 'Detergente líquido', description: 'Botella de 3 litros', category: 'Aseo', quantity: 7, minimumStock: 8, unitPrice: 5990, active: true },
  { id: 3, sku: 'BEB-008', name: 'Agua mineral', description: 'Pack de 6 botellas', category: 'Bebidas', quantity: 0, minimumStock: 5, unitPrice: 3290, active: true },
  { id: 4, sku: 'OFI-021', name: 'Resma carta', description: 'Papel blanco de 500 hojas', category: 'Oficina', quantity: 24, minimumStock: 6, unitPrice: 4990, active: true },
];

const productStorageKey = 'traceprostock-products-v1';
const movementStorageKey = 'traceprostock-movements-v1';

function loadProducts(): Product[] {
  const saved = localStorage.getItem(productStorageKey);
  if (!saved) return initialProducts;
  try {
    return JSON.parse(saved) as Product[];
  } catch {
    return initialProducts;
  }
}

function loadMovements(): Movement[] {
  const saved = localStorage.getItem(movementStorageKey);
  if (!saved) return [];
  try {
    return JSON.parse(saved) as Movement[];
  } catch {
    return [];
  }
}

function money(value: number) {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(value);
}

function stockState(product: Product) {
  if (!product.active) return { label: 'Inactivo', tone: 'medium' };
  if (product.quantity === 0) return { label: 'Sin stock', tone: 'danger' };
  if (product.quantity <= product.minimumStock) return { label: 'Stock bajo', tone: 'warning' };
  return { label: 'Disponible', tone: 'success' };
}

export default function App() {
  const [role, setRole] = useState<Role | null>(null);
  const [view, setView] = useState<View>('inicio');
  const [products, setProducts] = useState<Product[]>(loadProducts);
  const [movements, setMovements] = useState<Movement[]>(loadMovements);
  const [loginError, setLoginError] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [productModal, setProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);
  const [toast, setToast] = useState('');

  const saveProducts = (next: Product[]) => {
    setProducts(next);
    localStorage.setItem(productStorageKey, JSON.stringify(next));
  };

  const saveMovements = (next: Movement[]) => {
    setMovements(next);
    localStorage.setItem(movementStorageKey, JSON.stringify(next));
  };

  const login = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const username = String(data.get('username') || '').trim().toLowerCase();
    const password = String(data.get('password') || '');
    if (username === 'admin' && password === 'admin') {
      setRole('admin');
      setView('inicio');
      setLoginError('');
      return;
    }
    if (username === 'operario' && password === 'operario') {
      setRole('operario');
      setView('inicio');
      setLoginError('');
      return;
    }
    setLoginError('Usuario o clave incorrectos.');
  };

  const logout = () => {
    setRole(null);
    setView('inicio');
    setMenuOpen(false);
  };

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return products;
    return products.filter((product) =>
      [product.sku, product.name, product.category].some((value) => value.toLowerCase().includes(term)),
    );
  }, [products, search]);

  const stats = useMemo(() => ({
    products: products.length,
    low: products.filter((product) => product.quantity > 0 && product.quantity <= product.minimumStock).length,
    empty: products.filter((product) => product.quantity === 0).length,
    units: products.reduce((total, product) => total + product.quantity, 0),
  }), [products]);

  const navigate = (nextView: View) => {
    setView(nextView);
    setMenuOpen(false);
  };

  const openNewProduct = () => {
    setEditingProduct(null);
    setProductModal(true);
  };

  const openEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductModal(true);
  };

  const submitProduct = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const sku = String(data.get('sku') || '').trim().toUpperCase();
    const duplicate = products.some((product) => product.sku === sku && product.id !== editingProduct?.id);
    if (duplicate) {
      setToast('El SKU ya está registrado.');
      return;
    }
    const product: Product = {
      id: editingProduct?.id ?? Date.now(),
      sku,
      name: String(data.get('name') || '').trim(),
      description: String(data.get('description') || '').trim(),
      category: String(data.get('category') || '').trim(),
      quantity: Number(data.get('quantity') || 0),
      minimumStock: Number(data.get('minimumStock') || 0),
      unitPrice: Number(data.get('unitPrice') || 0),
      active: data.get('active') === 'on',
    };
    const next = editingProduct
      ? products.map((item) => item.id === editingProduct.id ? product : item)
      : [...products, product];
    saveProducts(next);
    setProductModal(false);
    setToast(editingProduct ? 'Producto actualizado.' : 'Producto registrado.');
  };

  const confirmDelete = () => {
    if (!deleteProduct) return;
    saveProducts(products.filter((product) => product.id !== deleteProduct.id));
    setDeleteProduct(null);
    setToast('Producto eliminado.');
  };

  const submitMovement = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const productId = Number(data.get('productId'));
    const type = String(data.get('type')) as MovementType;
    const quantity = Number(data.get('quantity'));
    const product = products.find((item) => item.id === productId);
    if (!product || quantity <= 0) {
      setToast('Revisa el producto y la cantidad.');
      return;
    }
    if (type === 'salida' && product.quantity < quantity) {
      setToast('No hay stock suficiente.');
      return;
    }
    const nextQuantity = type === 'entrada' ? product.quantity + quantity : product.quantity - quantity;
    saveProducts(products.map((item) => item.id === product.id ? { ...item, quantity: nextQuantity } : item));
    saveMovements([{
      id: Date.now(),
      productId: product.id,
      productName: product.name,
      type,
      quantity,
      date: new Date().toLocaleString('es-CL', { dateStyle: 'short', timeStyle: 'short' }),
      user: role === 'admin' ? 'Administrador' : 'Operario',
    }, ...movements]);
    event.currentTarget.reset();
    setToast(type === 'entrada' ? 'Entrada registrada.' : 'Salida registrada.');
  };

  if (!role) {
    return (
      <IonApp>
        <IonPage>
          <IonContent fullscreen className="login-content">
            <main className="login-layout">
              <section className="login-panel">
                <div className="brand-lockup">
                  <span className="brand-icon"><IonIcon icon={cubeOutline} /></span>
                  <div>
                    <strong>TraceProStock</strong>
                    <span>Control de inventario</span>
                  </div>
                </div>
                <div className="login-heading">
                  <h1>Iniciar sesión</h1>
                  <p>Ingresa con tu cuenta de administrador u operario.</p>
                </div>
                <form onSubmit={login} className="login-form">
                  <IonInput name="username" label="Usuario" labelPlacement="stacked" fill="outline" autocomplete="username" required />
                  <IonInput name="password" type="password" label="Clave" labelPlacement="stacked" fill="outline" autocomplete="current-password" required />
                  {loginError && <p className="form-error">{loginError}</p>}
                  <IonButton type="submit" expand="block">Ingresar</IonButton>
                </form>
                <div className="demo-access">
                  <span>Administrador: admin / admin</span>
                  <span>Operario: operario / operario</span>
                </div>
              </section>
            </main>
          </IonContent>
        </IonPage>
      </IonApp>
    );
  }

  const navigation = role === 'admin'
    ? [
        { id: 'inicio' as View, label: 'Inicio', icon: homeOutline },
        { id: 'productos' as View, label: 'Productos', icon: fileTrayStackedOutline },
        { id: 'movimientos' as View, label: 'Movimientos', icon: swapHorizontalOutline },
        { id: 'alertas' as View, label: 'Alertas', icon: alertCircleOutline },
      ]
    : [
        { id: 'inicio' as View, label: 'Inicio', icon: homeOutline },
        { id: 'productos' as View, label: 'Productos', icon: fileTrayStackedOutline },
        { id: 'movimientos' as View, label: 'Movimiento', icon: swapHorizontalOutline },
      ];

  const viewTitle = navigation.find((item) => item.id === view)?.label ?? 'Inicio';

  return (
    <IonApp>
      <IonPage>
        <div className="app-layout">
          <aside className={`sidebar ${menuOpen ? 'is-open' : ''}`}>
            <button className="brand-button" onClick={() => navigate('inicio')}>
              <span className="brand-icon"><IonIcon icon={cubeOutline} /></span>
              <span>TraceProStock</span>
            </button>
            <nav className="desktop-nav" aria-label="Navegación principal">
              {navigation.map((item) => (
                <button key={item.id} className={view === item.id ? 'active' : ''} onClick={() => navigate(item.id)}>
                  <IonIcon icon={item.icon} />
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
            <button className="logout-button" onClick={logout}>
              <IonIcon icon={logOutOutline} />
              <span>Salir</span>
            </button>
          </aside>
          {menuOpen && <button className="menu-backdrop" aria-label="Cerrar menú" onClick={() => setMenuOpen(false)} />}

          <section className="main-column">
            <IonHeader className="app-header">
              <IonToolbar>
                <div className="topbar">
                  <button className="menu-button" onClick={() => setMenuOpen(true)} aria-label="Abrir menú">
                    <IonIcon icon={menuOutline} />
                  </button>
                  <div>
                    <IonNote>{role === 'admin' ? 'Administración' : 'Operación'}</IonNote>
                    <h1>{viewTitle}</h1>
                  </div>
                  <button className="user-button" onClick={logout} title="Cerrar sesión">
                    <span>{role === 'admin' ? 'Administrador' : 'Operario'}</span>
                    <IonIcon icon={exitOutline} />
                  </button>
                </div>
              </IonToolbar>
            </IonHeader>

            <IonContent className="app-content">
              <main className="content-inner">
                {view === 'inicio' && (
                  <Dashboard role={role} stats={stats} products={products} onNavigate={navigate} />
                )}
                {view === 'productos' && (
                  <ProductsView
                    role={role}
                    products={filteredProducts}
                    search={search}
                    onSearch={setSearch}
                    onNew={openNewProduct}
                    onEdit={openEditProduct}
                    onDelete={setDeleteProduct}
                    onMovement={() => navigate('movimientos')}
                  />
                )}
                {view === 'movimientos' && (
                  <MovementsView products={products} movements={movements} onSubmit={submitMovement} />
                )}
                {view === 'alertas' && role === 'admin' && <AlertsView products={products} />}
              </main>
            </IonContent>

            <nav className="mobile-nav" aria-label="Navegación móvil">
              {navigation.map((item) => (
                <button key={item.id} className={view === item.id ? 'active' : ''} onClick={() => navigate(item.id)}>
                  <IonIcon icon={item.icon} />
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          </section>
        </div>

        <IonModal isOpen={productModal} onDidDismiss={() => setProductModal(false)}>
          <IonHeader>
            <IonToolbar>
              <div className="modal-title-row">
                <h2>{editingProduct ? 'Editar producto' : 'Nuevo producto'}</h2>
                <IonButton fill="clear" color="medium" onClick={() => setProductModal(false)}>Cerrar</IonButton>
              </div>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            <form className="product-form" onSubmit={submitProduct}>
              <div className="form-grid">
                <IonInput name="sku" label="SKU" labelPlacement="stacked" fill="outline" value={editingProduct?.sku} required />
                <IonInput name="name" label="Nombre" labelPlacement="stacked" fill="outline" value={editingProduct?.name} required />
                <IonInput name="category" label="Categoría" labelPlacement="stacked" fill="outline" value={editingProduct?.category} required />
                <IonInput name="unitPrice" type="number" min="0" label="Precio unitario" labelPlacement="stacked" fill="outline" value={editingProduct?.unitPrice ?? 0} required />
                <IonInput name="quantity" type="number" min="0" label="Stock actual" labelPlacement="stacked" fill="outline" value={editingProduct?.quantity ?? 0} required />
                <IonInput name="minimumStock" type="number" min="0" label="Stock mínimo" labelPlacement="stacked" fill="outline" value={editingProduct?.minimumStock ?? 0} required />
              </div>
              <IonInput name="description" label="Descripción" labelPlacement="stacked" fill="outline" value={editingProduct?.description} required />
              <IonItem lines="none" className="toggle-row">
                <IonToggle name="active" checked={editingProduct?.active ?? true}>Producto activo</IonToggle>
              </IonItem>
              <div className="form-actions">
                <IonButton type="button" fill="outline" color="medium" onClick={() => setProductModal(false)}>Cancelar</IonButton>
                <IonButton type="submit">Guardar</IonButton>
              </div>
            </form>
          </IonContent>
        </IonModal>

        <IonAlert
          isOpen={Boolean(deleteProduct)}
          header="Eliminar producto"
          message={deleteProduct ? `Se eliminará ${deleteProduct.name}.` : ''}
          buttons={[
            { text: 'Cancelar', role: 'cancel', handler: () => setDeleteProduct(null) },
            { text: 'Eliminar', role: 'destructive', handler: confirmDelete },
          ]}
          onDidDismiss={() => setDeleteProduct(null)}
        />
        <IonToast isOpen={Boolean(toast)} message={toast} duration={2200} onDidDismiss={() => setToast('')} />
      </IonPage>
    </IonApp>
  );
}

function Dashboard({ role, stats, products, onNavigate }: {
  role: Role;
  stats: { products: number; low: number; empty: number; units: number };
  products: Product[];
  onNavigate: (view: View) => void;
}) {
  const alerts = products.filter((product) => product.quantity <= product.minimumStock).slice(0, 4);
  return (
    <>
      <section className="page-heading">
        <div>
          <h2>{role === 'admin' ? 'Resumen de inventario' : 'Estado de bodega'}</h2>
          <p>{new Date().toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        </div>
        <IonButton onClick={() => onNavigate(role === 'admin' ? 'productos' : 'movimientos')}>
          <IonIcon slot="start" icon={role === 'admin' ? addCircleOutline : swapHorizontalOutline} />
          {role === 'admin' ? 'Gestionar productos' : 'Registrar movimiento'}
        </IonButton>
      </section>
      <section className="stats-grid">
        <StatCard label="Productos" value={stats.products} icon={fileTrayStackedOutline} />
        <StatCard label="Stock bajo" value={stats.low} icon={alertCircleOutline} tone="warning" />
        <StatCard label="Sin stock" value={stats.empty} icon={removeCircleOutline} tone="danger" />
        <StatCard label="Unidades" value={stats.units} icon={barChartOutline} tone="success" />
      </section>
      <section className="dashboard-grid">
        <IonCard className="surface-card">
          <IonCardContent>
            <div className="section-title">
              <h3>Productos</h3>
              <button onClick={() => onNavigate('productos')}>Ver todos</button>
            </div>
            <ProductTable products={products.slice(0, 5)} compact />
          </IonCardContent>
        </IonCard>
        <IonCard className="surface-card">
          <IonCardContent>
            <div className="section-title">
              <h3>Alertas</h3>
              {role === 'admin' && <button onClick={() => onNavigate('alertas')}>Ver todas</button>}
            </div>
            <div className="alert-list">
              {alerts.length ? alerts.map((product) => (
                <div className="alert-row" key={product.id}>
                  <span className={`alert-symbol ${product.quantity === 0 ? 'danger' : 'warning'}`}>
                    <IonIcon icon={alertCircleOutline} />
                  </span>
                  <div>
                    <strong>{product.name}</strong>
                    <span>Stock {product.quantity} · Mínimo {product.minimumStock}</span>
                  </div>
                </div>
              )) : <EmptyState text="No hay alertas de stock." />}
            </div>
          </IonCardContent>
        </IonCard>
      </section>
    </>
  );
}

function StatCard({ label, value, icon, tone = 'primary' }: { label: string; value: number; icon: string; tone?: string }) {
  return (
    <IonCard className="stat-card">
      <IonCardContent>
        <span className={`stat-icon ${tone}`}><IonIcon icon={icon} /></span>
        <div><span>{label}</span><strong>{value}</strong></div>
      </IonCardContent>
    </IonCard>
  );
}

function ProductsView({ role, products, search, onSearch, onNew, onEdit, onDelete, onMovement }: {
  role: Role;
  products: Product[];
  search: string;
  onSearch: (value: string) => void;
  onNew: () => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onMovement: () => void;
}) {
  return (
    <>
      <section className="page-heading">
        <div><h2>Inventario</h2><p>{products.length} productos visibles</p></div>
        <IonButton onClick={role === 'admin' ? onNew : onMovement}>
          <IonIcon slot="start" icon={role === 'admin' ? addCircleOutline : swapHorizontalOutline} />
          {role === 'admin' ? 'Nuevo producto' : 'Registrar movimiento'}
        </IonButton>
      </section>
      <IonCard className="surface-card products-card">
        <IonCardContent>
          <IonSearchbar value={search} onIonInput={(event) => onSearch(event.detail.value || '')} placeholder="Buscar por nombre, SKU o categoría" debounce={150} />
          <ProductTable products={products} actions={role === 'admin'} onEdit={onEdit} onDelete={onDelete} />
        </IonCardContent>
      </IonCard>
    </>
  );
}

function ProductTable({ products, actions = false, compact = false, onEdit, onDelete }: {
  products: Product[];
  actions?: boolean;
  compact?: boolean;
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
}) {
  if (!products.length) return <EmptyState text="No se encontraron productos." />;
  return (
    <div className="product-table-wrap">
      <table className="product-table">
        <thead><tr><th>Producto</th><th>Categoría</th><th>Stock</th><th>Estado</th>{actions && <th aria-label="Acciones" />}</tr></thead>
        <tbody>
          {products.map((product) => {
            const state = stockState(product);
            return (
              <tr key={product.id}>
                <td><strong>{product.name}</strong><span>{product.sku}{!compact && ` · ${money(product.unitPrice)}`}</span></td>
                <td data-label="Categoría">{product.category}</td>
                <td data-label="Stock"><strong>{product.quantity}</strong><span>Mín. {product.minimumStock}</span></td>
                <td data-label="Estado"><IonBadge color={state.tone}>{state.label}</IonBadge></td>
                {actions && <td className="row-actions">
                  <IonButton fill="clear" size="small" aria-label={`Editar ${product.name}`} onClick={() => onEdit?.(product)}><IonIcon icon={createOutline} /></IonButton>
                  <IonButton fill="clear" size="small" color="danger" aria-label={`Eliminar ${product.name}`} onClick={() => onDelete?.(product)}><IonIcon icon={trashOutline} /></IonButton>
                </td>}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function MovementsView({ products, movements, onSubmit }: {
  products: Product[];
  movements: Movement[];
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <>
      <section className="page-heading"><div><h2>Movimientos de stock</h2><p>Entradas y salidas de productos</p></div></section>
      <section className="movement-grid">
        <IonCard className="surface-card movement-form-card">
          <IonCardContent>
            <h3>Registrar movimiento</h3>
            <form className="movement-form" onSubmit={onSubmit}>
              <IonSelect name="productId" label="Producto" labelPlacement="stacked" fill="outline" placeholder="Seleccionar" required>
                {products.filter((product) => product.active).map((product) => <IonSelectOption key={product.id} value={product.id}>{product.sku} - {product.name} ({product.quantity})</IonSelectOption>)}
              </IonSelect>
              <IonSelect name="type" label="Tipo" labelPlacement="stacked" fill="outline" value="entrada" required>
                <IonSelectOption value="entrada">Entrada</IonSelectOption>
                <IonSelectOption value="salida">Salida</IonSelectOption>
              </IonSelect>
              <IonInput name="quantity" type="number" min="1" value="1" label="Cantidad" labelPlacement="stacked" fill="outline" required />
              <IonButton type="submit" expand="block">
                <IonIcon slot="start" icon={enterOutline} />Guardar movimiento
              </IonButton>
            </form>
          </IonCardContent>
        </IonCard>
        <IonCard className="surface-card history-card">
          <IonCardContent>
            <h3>Historial</h3>
            <IonList lines="full">
              {movements.length ? movements.map((movement) => (
                <IonItem key={movement.id}>
                  <span slot="start" className={`movement-icon ${movement.type}`}>
                    <IonIcon icon={movement.type === 'entrada' ? addCircleOutline : removeCircleOutline} />
                  </span>
                  <IonLabel>
                    <h2>{movement.productName}</h2>
                    <p>{movement.date} · {movement.user}</p>
                  </IonLabel>
                  <div slot="end" className="movement-amount">
                    <strong>{movement.type === 'entrada' ? '+' : '-'}{movement.quantity}</strong>
                    <span>{movement.type}</span>
                  </div>
                </IonItem>
              )) : <EmptyState text="Aún no hay movimientos registrados." />}
            </IonList>
          </IonCardContent>
        </IonCard>
      </section>
    </>
  );
}

function AlertsView({ products }: { products: Product[] }) {
  const alerts = products.filter((product) => product.quantity <= product.minimumStock);
  return (
    <>
      <section className="page-heading"><div><h2>Alertas de stock</h2><p>Productos que requieren revisión</p></div></section>
      <IonCard className="surface-card alerts-card">
        <IonCardContent>
          {alerts.length ? alerts.map((product) => (
            <article className="alert-detail" key={product.id}>
              <span className={`alert-symbol ${product.quantity === 0 ? 'danger' : 'warning'}`}><IonIcon icon={alertCircleOutline} /></span>
              <div><h3>{product.name}</h3><p>{product.sku} · {product.category}</p></div>
              <div className="alert-values"><span>Actual <strong>{product.quantity}</strong></span><span>Mínimo <strong>{product.minimumStock}</strong></span></div>
              <IonBadge color={product.quantity === 0 ? 'danger' : 'warning'}>{product.quantity === 0 ? 'Sin stock' : 'Stock bajo'}</IonBadge>
            </article>
          )) : <EmptyState text="No existen productos bajo el mínimo." />}
        </IonCardContent>
      </IonCard>
    </>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div className="empty-state"><IonIcon icon={cubeOutline} /><span>{text}</span></div>;
}
