import { useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  ChevronDown,
  Clipboard,
  FileDown,
  FileUp,
  Minus,
  PackageOpen,
  Plus,
  Search,
  ShoppingBasket,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { categories, initialProducts, normalizeProduct, type Product, type ProductCategory } from "@/lib/catalog";

const LIST_KEY = "lista-mooca-items-v1";
const CATALOG_KEY = "lista-mooca-catalog-v1";
const CURRENCY = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

type CartLine = { productId: string; quantity: number };

type CatalogImport = Product[] | { products?: Product[] };

function formatPrice(value: number) {
  return CURRENCY.format(value);
}

function isProduct(value: unknown): value is Product {
  if (!value || typeof value !== "object") return false;
  const product = value as Partial<Product>;
  return typeof product.id === "string" && typeof product.name === "string" && typeof product.brand === "string" && typeof product.category === "string" && typeof product.price === "number" && Number.isFinite(product.price) && product.price >= 0;
}

function isCatalog(value: unknown): value is Product[] {
  return Array.isArray(value) && value.every(isProduct);
}

function isCart(value: unknown): value is CartLine[] {
  return Array.isArray(value) && value.every((line) => {
    if (!line || typeof line !== "object") return false;
    const item = line as Partial<CartLine>;
    return typeof item.productId === "string" && typeof item.quantity === "number" && Number.isInteger(item.quantity) && item.quantity > 0;
  });
}

function readStored<T>(key: string, fallback: T, validate: (value: unknown) => value is T): T {
  try {
    const value = localStorage.getItem(key);
    if (!value) return fallback;
    const parsed: unknown = JSON.parse(value);
    return validate(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function copyTextFallback(text: string) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand("copy");
  textarea.remove();
  if (!copied) throw new Error("copy_failed");
}

function buildShareText(lines: Array<{ product: Product; quantity: number }>, total: number) {
  const date = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date());
  const items = lines.map(({ product, quantity }) => {
    const subtotal = product.price * quantity;
    return `☐ ${quantity}x ${product.name} — ${product.brand} (${formatPrice(subtotal)})`;
  });
  return [
    "LISTA DE COMPRAS — ASSAÍ MOOCA",
    "Rua Javari, 403 — Lj 3",
    `Atualizada em ${date}`,
    "",
    ...items,
    "",
    `TOTAL ESTIMADO: ${formatPrice(total)}`,
    "",
    "*Valores estimados. Confirme preços e disponibilidade na loja.*",
  ].join("\n");
}

export default function Home() {
  const [catalog, setCatalog] = useState<Product[]>(() => readStored(CATALOG_KEY, initialProducts, isCatalog));
  const [cart, setCart] = useState<CartLine[]>(() => readStored(LIST_KEY, [], isCart));
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<(typeof categories)[number]>("Todos");
  const [copied, setCopied] = useState(false);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem(LIST_KEY, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem(CATALOG_KEY, JSON.stringify(catalog));
  }, [catalog]);

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("pt-BR");
    return catalog.filter((product) => {
      const matchesCategory = category === "Todos" || product.category === category;
      const matchesQuery = !normalizedQuery || `${product.name} ${product.brand}`.toLocaleLowerCase("pt-BR").includes(normalizedQuery);
      return matchesCategory && matchesQuery;
    });
  }, [catalog, category, query]);

  const cartLines = useMemo(() => {
    return cart
      .map((line) => ({ product: catalog.find((product) => product.id === line.productId), quantity: line.quantity }))
      .filter((line): line is { product: Product; quantity: number } => Boolean(line.product));
  }, [cart, catalog]);

  const total = cartLines.reduce((sum, line) => sum + line.product.price * line.quantity, 0);
  const itemCount = cart.reduce((sum, line) => sum + line.quantity, 0);
  const selectedIds = new Set(cart.map((line) => line.productId));

  function addProduct(product: Product) {
    setCart((current) => {
      const existing = current.find((line) => line.productId === product.id);
      if (existing) return current.map((line) => line.productId === product.id ? { ...line, quantity: line.quantity + 1 } : line);
      return [...current, { productId: product.id, quantity: 1 }];
    });
  }

  function changeQuantity(productId: string, delta: number) {
    setCart((current) => current
      .map((line) => line.productId === productId ? { ...line, quantity: Math.max(0, line.quantity + delta) } : line)
      .filter((line) => line.quantity > 0));
  }

  function setQuantity(productId: string, value: string) {
    const quantity = Math.max(0, Math.floor(Number(value) || 0));
    setCart((current) => current.map((line) => line.productId === productId ? { ...line, quantity } : line).filter((line) => line.quantity > 0));
  }

  async function copyList() {
    if (!cartLines.length) {
      toast.error("Adicione pelo menos um item à lista.");
      return;
    }
    const text = buildShareText(cartLines, total);
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        copyTextFallback(text);
      }
      setCopied(true);
      toast.success("Lista copiada. Agora é só colar no WhatsApp.");
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      try {
        copyTextFallback(text);
        setCopied(true);
        toast.success("Lista copiada. Agora é só colar no WhatsApp.");
        window.setTimeout(() => setCopied(false), 2200);
      } catch {
        toast.error("Não foi possível copiar automaticamente. Tente selecionar e copiar novamente.");
      }
    }
  }

  function clearList() {
    if (!cartLines.length) return;
    setCart([]);
    toast.success("Lista limpa.");
  }

  function exportCatalog() {
    const blob = new Blob([JSON.stringify(catalog, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "catalogo-lista-mooca.json";
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success("Catálogo exportado em JSON.");
  }

  function importCatalog(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const raw = String(reader.result ?? "");
        let parsed: CatalogImport;
        if (file.name.toLowerCase().endsWith(".csv")) {
          const rows = raw.split(/\r?\n/).map((row) => row.trim()).filter(Boolean);
          const headers = rows.shift()?.split(",").map((header) => header.trim().toLowerCase()) ?? [];
          parsed = rows.map((row) => {
            const values = row.split(",").map((value) => value.trim().replace(/^"|"$/g, ""));
            return Object.fromEntries(headers.map((header, index) => [header, values[index]])) as Partial<Product>;
          }) as Product[];
        } else {
          parsed = JSON.parse(raw) as CatalogImport;
        }
        const source = Array.isArray(parsed) ? parsed : parsed.products ?? [];
        const normalized = source.map((product, index) => normalizeProduct(product, index)).filter((product): product is Product => Boolean(product));
        if (!normalized.length) throw new Error("empty");
        setCatalog(normalized);
        setCart([]);
        toast.success(`${normalized.length} produtos importados.`);
      } catch {
        toast.error("Arquivo inválido. Use JSON ou CSV com name, brand, price e category.");
      } finally {
        event.target.value = "";
      }
    };
    reader.readAsText(file);
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-lockup">
          <div className="brand-mark"><ShoppingBasket size={20} strokeWidth={2.5} /></div>
          <div>
            <div className="brand-name">lista<span>mooca</span></div>
            <div className="brand-caption">comprar sem esquecer</div>
          </div>
        </div>
        <div className="topbar-actions">
          <button className="quiet-button" type="button" onClick={exportCatalog} title="Baixar o catálogo atual">
            <FileDown size={16} /> Exportar catálogo
          </button>
          <button className="quiet-button" type="button" onClick={() => fileInput.current?.click()} title="Importar catálogo JSON ou CSV">
            <FileUp size={16} /> Atualizar catálogo
          </button>
          <input ref={fileInput} className="hidden-input" type="file" accept=".json,.csv,application/json,text/csv" onChange={importCatalog} />
        </div>
      </header>

      <main className="page-content">
        <section className="hero-row">
          <div>
            <p className="eyebrow"><Sparkles size={14} /> sua próxima compra começa aqui</p>
            <h1>Lista de compras<br /><em>sem papel.</em></h1>
            <p className="hero-copy">Escolha seus produtos, ajuste as quantidades e leve a lista pronta no celular quando sair de casa.</p>
          </div>
          <div className="store-note">
            <div className="store-note-icon"><ShoppingBasket size={18} /></div>
            <div>
              <strong>Assaí Mooca</strong>
              <span>Rua Javari, 403 — Lj 3<br />Mooca, São Paulo — SP</span>
            </div>
            <span className="status-dot" title="Loja selecionada" />
          </div>
        </section>

        <div className="workspace">
          <section className="catalog-panel">
            <div className="panel-heading">
              <div>
                <p className="section-kicker">catálogo da loja</p>
                <h2>O que você precisa?</h2>
              </div>
              <span className="product-count">{catalog.length} produtos</span>
            </div>

            <div className="search-wrap">
              <Search size={18} />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por produto ou marca..." aria-label="Buscar produtos" />
              {query && <button className="clear-search" type="button" onClick={() => setQuery("")} aria-label="Limpar busca"><X size={16} /></button>}
            </div>

            <div className="category-row" aria-label="Categorias">
              <div className="category-scroll">
                {categories.slice(0, 5).map((item) => (
                  <button key={item} type="button" className={`category-pill ${category === item ? "active" : ""}`} onClick={() => setCategory(item)}>{item}</button>
                ))}
                <div className="category-more">
                  <button type="button" className={`category-pill ${categories.slice(5).includes(category) ? "active" : ""}`} onClick={() => setShowCategoryMenu((current) => !current)}>Mais <ChevronDown size={14} /></button>
                  {showCategoryMenu && <div className="category-menu">{categories.slice(5).map((item) => <button key={item} type="button" onClick={() => { setCategory(item); setShowCategoryMenu(false); }}>{item}</button>)}</div>}
                </div>
              </div>
            </div>

            <div className="catalog-meta">
              <span>{filteredProducts.length} {filteredProducts.length === 1 ? "resultado" : "resultados"}</span>
              {(query || category !== "Todos") && <button type="button" onClick={() => { setQuery(""); setCategory("Todos"); }}>Limpar filtros</button>}
            </div>

            {catalog.length === 0 ? (
              <div className="empty-state catalog-empty">
                <div className="empty-icon"><PackageOpen size={20} /></div>
                <h3>Catálogo vazio</h3>
                <p>Importe um arquivo JSON ou CSV para começar a montar sua lista.</p>
                <button type="button" className="text-button" onClick={() => fileInput.current?.click()}>Importar catálogo</button>
              </div>
            ) : filteredProducts.length ? (
              <div className="product-list">
                {filteredProducts.map((product) => {
                  const isSelected = selectedIds.has(product.id);
                  return (
                    <article className={`product-card ${isSelected ? "selected" : ""}`} key={product.id}>
                      <div className={`product-icon category-${product.category.toLowerCase().replaceAll(" ", "-")}`}><PackageOpen size={19} /></div>
                      <div className="product-info">
                        <h3>{product.name}</h3>
                        <div className="product-detail"><span>{product.brand}</span><span className="dot-separator">•</span><span>{product.category}</span></div>
                      </div>
                      <div className="product-price">{formatPrice(product.price)}</div>
                      <button type="button" className={`add-button ${isSelected ? "added" : ""}`} onClick={() => addProduct(product)} aria-label={`${isSelected ? "Adicionar mais" : "Adicionar"} ${product.name}`}>
                        {isSelected ? <><Check size={16} /> <span>Na lista</span></> : <><Plus size={17} /> <span>Adicionar</span></>}
                      </button>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="empty-state catalog-empty">
                <div className="empty-icon"><Search size={20} /></div>
                <h3>Nada encontrado</h3>
                <p>Tente outra palavra ou limpe os filtros para ver o catálogo completo.</p>
                <button type="button" className="text-button" onClick={() => { setQuery(""); setCategory("Todos"); }}>Ver todos os produtos</button>
              </div>
            )}
            <p className="catalog-disclaimer">Preços estimados para referência. Podem variar conforme a loja, a data, a promoção e a disponibilidade.</p>
          </section>

          <aside className="list-panel">
            <div className="list-panel-top">
              <div>
                <p className="section-kicker">sua checklist</p>
                <h2>Minha lista <span>{itemCount ? itemCount : ""}</span></h2>
              </div>
              {cartLines.length > 0 && <button className="clear-list-button" type="button" onClick={clearList}>Limpar</button>}
            </div>

            {cartLines.length ? (
              <div className="selected-list">
                {cartLines.map(({ product, quantity }) => (
                  <div className="selected-item" key={product.id}>
                    <div className="selected-main">
                      <div className="selected-check"><Check size={13} /></div>
                      <div><strong>{product.name}</strong><span>{product.brand}</span></div>
                      <button className="remove-item" type="button" onClick={() => setQuantity(product.id, "0")} aria-label={`Remover ${product.name}`}><Trash2 size={15} /></button>
                    </div>
                    <div className="selected-bottom">
                      <div className="quantity-control">
                        <button type="button" onClick={() => changeQuantity(product.id, -1)} aria-label="Diminuir quantidade"><Minus size={14} /></button>
                        <input aria-label={`Quantidade de ${product.name}`} value={quantity} onChange={(event) => setQuantity(product.id, event.target.value)} inputMode="numeric" />
                        <button type="button" onClick={() => changeQuantity(product.id, 1)} aria-label="Aumentar quantidade"><Plus size={14} /></button>
                      </div>
                      <span className="line-total">{formatPrice(product.price * quantity)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state list-empty">
                <div className="empty-basket"><ShoppingBasket size={25} /></div>
                <h3>Sua lista começa aqui</h3>
                <p>Adicione produtos do catálogo e eles aparecem neste espaço.</p>
              </div>
            )}

            <div className="list-footer">
              <div className="total-row"><span>Total estimado</span><strong>{formatPrice(total)}</strong></div>
              <button type="button" className="copy-button" onClick={copyList}><Clipboard size={17} /> {copied ? "Lista copiada!" : "Copiar para o WhatsApp"}</button>
              <p className="copy-hint">Copia itens, quantidades e total em um texto organizado.</p>
            </div>
          </aside>
        </div>

        <footer className="page-footer"><span>lista<span className="footer-accent">mooca</span></span><span>feito para facilitar a ida ao mercado</span></footer>
      </main>
    </div>
  );
}
