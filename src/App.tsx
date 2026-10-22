import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  ArrowRight,
  Camera,
  Check,
  ChevronDown,
  Clock3,
  Download,
  FileUp,
  Flame,
  Leaf,
  Menu,
  Moon,
  Pencil,
  Plus,
  Search,
  ShoppingCart,
  Sun,
  Trash2,
  Upload,
  X,
  Zap,
} from 'lucide-react';

type View = 'pantry' | 'shop' | 'orders';
type Modal = 'scan' | 'import' | 'checkout' | 'add' | 'recipe' | 'edit' | null;

type PantryItem = {
  id: string;
  name: string;
  amount: string;
  days: number;
  category: string;
  barcode?: string;
};

type Product = {
  name: string;
  category: string;
  detail: string;
  price: number;
  mark: string;
  status?: string;
};

type CartItem = {
  product: Product;
  qty: number;
};

type Order = {
  id: string;
  date: string;
  amount: number;
  items: string;
  slot: string;
  contact: string;
};

type Recipe = {
  title: string;
  detail: string;
  time: string;
  matches: string[];
};

let idCounter = 0;
const uid = () => `item-${Date.now()}-${idCounter++}`;

const initialPantry: PantryItem[] = [
  { id: uid(), name: 'Sourdough loaf', amount: '1 loaf', days: 1, category: 'Grains' },
  { id: uid(), name: 'Carrots', amount: '6 pieces', days: 2, category: 'Vegetable' },
  { id: uid(), name: 'Baby spinach', amount: '1 bag', days: 3, category: 'Vegetable' },
  { id: uid(), name: 'Greek yogurt', amount: '500 g', days: 5, category: 'Dairy' },
  { id: uid(), name: 'Pink Lady apples', amount: '4 pieces', days: 8, category: 'Fruit' },
  { id: uid(), name: 'Eggs', amount: '6 pieces', days: 11, category: 'Dairy' },
  { id: uid(), name: 'Lemons', amount: '3 pieces', days: 12, category: 'Fruit' },
  { id: uid(), name: 'Chickpeas', amount: '2 cans', days: 74, category: 'Other' },
];

const products: Product[] = [
  { name: 'Basmati rice', category: 'Grains & staples', detail: 'Long-grain, kitchen staple', price: 468, mark: 'BR' },
  { name: 'Whole wheat atta', category: 'Grains & staples', detail: 'Stone-milled everyday flour', price: 512, mark: 'WA' },
  { name: 'Sunflower cooking oil', category: 'Pantry basics', detail: 'Light, neutral kitchen oil', price: 782, mark: 'SO', status: 'Low stock' },
  { name: 'Yellow lentils', category: 'Grains & staples', detail: 'Wholesome moong dal', price: 286, mark: 'YL' },
  { name: 'Tomato passata', category: 'Pantry basics', detail: 'Slow-cooked, no added sugar', price: 674, mark: 'TP' },
  { name: 'Full cream milk', category: 'Chilled', detail: 'Morning delivery chilled', price: 846, mark: 'FM' },
  { name: 'Farm eggs', category: 'Chilled', detail: 'Medium, graded eggs', price: 296, mark: 'FE' },
  { name: 'House filter coffee', category: 'Beverage', detail: 'Dark roast, cafe blend', price: 934, mark: 'CF', status: 'Made to order' },
  { name: 'Cane sugar', category: 'Pantry basics', detail: 'Fine crystal sugar', price: 304, mark: 'CS' },
  { name: 'Red onions', category: 'Fresh produce', detail: 'Firm, kitchen-ready', price: 238, mark: 'RO' },
  { name: 'Bananas', category: 'Fresh produce', detail: 'Ripe-at-room-temperature', price: 244, mark: 'BN', status: 'Low stock' },
  { name: 'Plain yogurt', category: 'Chilled', detail: 'Cultured, unsweetened', price: 588, mark: 'PY' },
];

const dailyEssentials = ['Milk', 'Eggs', 'Bananas', 'Bread', 'Butter', 'Cheese', 'Tomatoes', 'Potatoes'];

const recipeRules: { match: string[]; title: string; detail: string; time: string }[] = [
  { match: ['carrots', 'yogurt'], title: 'Golden carrot soup', detail: 'Carrots · yogurt · a touch of ginger', time: '30 MIN' },
  { match: ['spinach', 'eggs'], title: 'Greens & egg toast', detail: 'Spinach · eggs · sourdough', time: '15 MIN' },
  { match: ['sourdough', 'eggs'], title: 'Crisp sourdough egg toast', detail: 'Sourdough · eggs · a little seasoning', time: '10 MIN' },
  { match: ['sourdough'], title: 'Garlic sourdough croutons', detail: 'Sourdough · oil · garlic', time: '12 MIN' },
  { match: ['carrots'], title: 'Honey-glazed carrots', detail: 'Carrots · honey · butter', time: '20 MIN' },
  { match: ['spinach'], title: 'Wilted spinach salad', detail: 'Spinach · lemon · olive oil', time: '10 MIN' },
  { match: ['yogurt'], title: 'Yogurt parfait', detail: 'Yogurt · apples · honey', time: '5 MIN' },
  { match: ['apples'], title: 'Baked apples', detail: 'Apples · cinnamon · yogurt', time: '25 MIN' },
  { match: ['eggs'], title: 'Fluffy scrambled eggs', detail: 'Eggs · butter · salt', time: '8 MIN' },
  { match: ['lemons'], title: 'Lemon honey drink', detail: 'Lemons · honey · warm water', time: '3 MIN' },
  { match: ['chickpeas'], title: 'Chickpea salad bowl', detail: 'Chickpeas · lemon · olive oil', time: '10 MIN' },
  { match: ['bananas'], title: 'Banana smoothie', detail: 'Bananas · milk · yogurt', time: '5 MIN' },
  { match: ['onions'], title: 'Caramelised onions', detail: 'Onions · butter · a pinch of sugar', time: '25 MIN' },
  { match: ['bread'], title: 'Quick bread pudding', detail: 'Bread · eggs · milk', time: '35 MIN' },
];

function generateRecipes(pantry: PantryItem[]): Recipe[] {
  const expiring = pantry.filter((item) => item.days <= 3);
  if (expiring.length === 0) return [];
  const expiringNames = expiring.map((item) => item.name.toLowerCase());
  const scored = recipeRules
    .map((rule) => {
      const matches = rule.match.filter((ingredient) =>
        expiringNames.some((name) => name.includes(ingredient) || ingredient.includes(name.split(' ')[0]))
      );
      return { ...rule, matches, score: matches.length };
    })
    .filter((rule) => rule.score > 0)
    .sort((a, b) => b.score - a.score);

  if (scored.length === 0) {
    return [{
      title: 'Low-waste fridge clean-out',
      detail: expiring.map((item) => item.name).join(' · '),
      time: '20 MIN',
      matches: expiring.map((item) => item.name),
    }];
  }
  return scored.slice(0, 4).map((rule) => ({
    title: rule.title,
    detail: rule.detail,
    time: rule.time,
    matches: rule.matches,
  }));
}

function liveDate(): string {
  return new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date()).toUpperCase();
}

function formatINR(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

function downloadCSV(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function pantryToCSV(items: PantryItem[]): string {
  const header = 'name,quantity,unit,daysRemaining,category,barcode';
  const rows = items.map((item) =>
    [item.name, item.amount, '', item.days, item.category, item.barcode || '']
      .map((field) => `"${String(field).replace(/"/g, '""')}"`)
      .join(',')
  );
  return [header, ...rows].join('\n');
}

function parseCSV(text: string): PantryItem[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const items: PantryItem[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',').map((col) => col.replace(/^"|"$/g, '').replace(/""/g, '"'));
    if (cols[0]) {
      items.push({
        id: uid(),
        name: cols[0],
        amount: cols[1] || '1 item',
        days: parseInt(cols[3]) || 7,
        category: cols[4] || 'Other',
        barcode: cols[5] || undefined,
      });
    }
  }
  return items;
}

// ===== Persistence helpers =====
const STORAGE_KEY = 'freshtrack-state-v1';

type PersistedState = {
  pantry: PantryItem[];
  cart: CartItem[];
  orders: Order[];
  essentials: string[];
  started: boolean;
  dark: boolean;
};

function loadState(): Partial<PersistedState> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Partial<PersistedState>;
  } catch {
    return {};
  }
}

function saveState(state: PersistedState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // storage may be full or unavailable
  }
}

function Logo() {
  return (
    <div className="logo">
      <span className="logo-mark"><Leaf size={17} /></span>
      <span>
        <strong>FreshTrack</strong>
        <small>YOUR GENTLE PANTRY ON AUTOPILOT</small>
      </span>
    </div>
  );
}

function WelcomeView({ onStart }: { onStart: () => void }) {
  return (
    <main className="welcome">
      <div className="welcome-left">
        <div className="welcome-mark"><Leaf size={22} /></div>
        <div className="welcome-eyebrow">WELCOME TO FRESHTRACK</div>
        <h1>Your gentle pantry<br /><em>companion on autopilot.</em></h1>
        <p>Keep food fresh, waste less, and always know what to make next. FreshTrack quietly helps you stay on top of the things that matter in your kitchen.</p>
        <div className="welcome-features">
          <div className="welcome-feature">
            <span className="welcome-feature-icon"><Check size={16} /></span>
            <div>
              <strong>Track freshness</strong>
              <span>See what needs using before it expires</span>
            </div>
          </div>
          <div className="welcome-feature">
            <span className="welcome-feature-icon"><Zap size={16} /></span>
            <div>
              <strong>Get recipe ideas</strong>
              <span>Suggestions from what you already have</span>
            </div>
          </div>
          <div className="welcome-feature">
            <span className="welcome-feature-icon"><ShoppingCart size={16} /></span>
            <div>
              <strong>Build a shopping list</strong>
              <span>Restock effortlessly from your essentials</span>
            </div>
          </div>
        </div>
        <button className="start-btn" onClick={onStart}>
          Start your pantry <ArrowRight size={16} />
        </button>
        <small className="welcome-note">No account needed · saved on this device</small>
      </div>
      <div className="welcome-right">
        <img
          src="https://images.pexels.com/photos/4589141/pexels-photo-4589141.jpeg?auto=compress&cs=tinysrgb&h=900&w=600"
          alt="Fresh fruits, vegetables, and olive oil arranged in a kitchen"
          loading="eager"
        />
        <div className="welcome-overlay">
          <div className="welcome-overlay-card">
            <Check size={13} />
            <div>
              <strong>8 items</strong>
              <span>fresh in your pantry</span>
            </div>
          </div>
          <div className="welcome-overlay-card welcome-overlay-card-two">
            <Flame size={13} />
            <div>
              <strong>Recipe ready</strong>
              <span>from what you have</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function Header({ view, setView, onModal, cartCount, dark, toggleDark }: {
  view: View;
  setView: (view: View) => void;
  onModal: (modal: Modal) => void;
  cartCount: number;
  dark: boolean;
  toggleDark: () => void;
}) {
  return (
    <header className="topbar">
      <Logo />
      <div className="nav-actions">
        <div className="segmented">
          <button className={view === 'shop' ? 'active' : ''} onClick={() => setView('shop')}>Shop</button>
          <button className={view === 'orders' ? 'active' : ''} onClick={() => setView('orders')}>Orders</button>
          <button className={view === 'pantry' ? 'active' : ''} onClick={() => setView('pantry')}>Pantry</button>
        </div>
        <button className="outline-btn scan" onClick={() => onModal('scan')}><Camera size={14} /> Scan item</button>
        <button className="icon-btn" onClick={toggleDark} aria-label="Toggle dark mode">
          {dark ? <Sun size={15} /> : <Moon size={15} />}
        </button>
        <button className="cart-btn" onClick={() => setView('shop')}>
          <ShoppingCart size={16} />
          {cartCount > 0 && <b>{cartCount}</b>}
        </button>
      </div>
      <div className="mobile-actions">
        <button onClick={() => setView('pantry')} className={view === 'pantry' ? 'active' : ''}>Pantry</button>
        <button onClick={() => setView('shop')} className={view === 'shop' ? 'active' : ''}>Shop</button>
        <button onClick={() => setView('orders')} className={view === 'orders' ? 'active' : ''}>Orders</button>
        <button onClick={toggleDark}>{dark ? <Sun size={14} /> : <Moon size={14} />}</button>
        <button onClick={() => onModal('scan')}><Camera size={14} /></button>
      </div>
    </header>
  );
}

function Stat({ icon, value, label, helper }: { icon: ReactNode; value: string; label: string; helper: string }) {
  return (
    <div className="stat">
      <span className="stat-icon">{icon}</span>
      <strong>{value}</strong>
      <b>{label}</b>
      <small>{helper}</small>
    </div>
  );
}

function PantryCard({ item, onRemove, onEdit }: { item: PantryItem; onRemove: () => void; onEdit: () => void }) {
  return (
    <div className="pantry-card">
      <button className="checkbox" onClick={onRemove} aria-label={`Remove ${item.name}`} />
      <div>
        <strong>{item.name}</strong>
        <small>{item.amount}</small>
        <span className={`category ${item.category.toLowerCase()}`}><i />{item.category}</span>
      </div>
      <em className={item.days <= 0 ? 'expired' : item.days <= 3 ? 'urgent' : item.days <= 7 ? 'soon' : ''}>
        {item.days <= 0 ? 'Expired' : `${item.days} days left`}
      </em>
      <button className="card-edit" onClick={onEdit} aria-label={`Edit ${item.name}`}><Pencil size={13} /></button>
    </div>
  );
}

function SideCard({ title, children, accent = false }: { title: string; children: ReactNode; accent?: boolean }) {
  return (
    <section className={`side-card ${accent ? 'accent-card' : ''}`}>
      <div className="eyebrow"><span>{accent ? 'RIGHT NOW' : 'EVERY FEW DAYS'}</span>{accent ? <Zap size={14} /> : <Pencil size={12} />}</div>
      <h3>{title}</h3>
      {children}
    </section>
  );
}

function TodaySummary({ pantry, recipes, onRecipe }: { pantry: PantryItem[]; recipes: Recipe[]; onRecipe: (recipe: Recipe) => void }) {
  const expiringToday = pantry.filter((item) => item.days > 0 && item.days <= 1);
  const expiringThisWeek = pantry.filter((item) => item.days > 1 && item.days <= 7);
  const expiredCount = pantry.filter((item) => item.days <= 0).length;

  const totalAttention = expiringToday.length + expiringThisWeek.length + expiredCount;

  if (totalAttention === 0 && recipes.length === 0) {
    return (
      <section className="today-summary today-summary-clear">
        <div className="today-summary-icon"><Leaf size={18} /></div>
        <div>
          <strong>Your pantry is in great shape</strong>
          <p>Nothing needs urgent attention today. Keep it up!</p>
        </div>
      </section>
    );
  }

  return (
    <section className="today-summary">
      <div className="today-summary-header">
        <div className="eyebrow"><Flame size={11} /> TODAY&apos;S PRIORITIES</div>
      </div>
      <div className="today-summary-body">
        {expiredCount > 0 && (
          <div className="today-item today-item-expired">
            <span className="today-item-dot" />
            <div>
              <strong>{expiredCount} expired {expiredCount > 1 ? 'items' : 'item'}</strong>
              <p>Remove these to keep your pantry tidy.</p>
            </div>
          </div>
        )}
        {expiringToday.length > 0 && (
          <div className="today-item today-item-urgent">
            <span className="today-item-dot" />
            <div>
              <strong>{expiringToday.length} {expiringToday.length > 1 ? 'items' : 'item'} to use today</strong>
              <p>{expiringToday.map((item) => item.name).join(', ')}</p>
            </div>
          </div>
        )}
        {expiringThisWeek.length > 0 && (
          <div className="today-item today-item-soon">
            <span className="today-item-dot" />
            <div>
              <strong>{expiringThisWeek.length} {expiringThisWeek.length > 1 ? 'items' : 'item'} this week</strong>
              <p>{expiringThisWeek.map((item) => item.name).join(', ')}</p>
            </div>
          </div>
        )}
        {recipes.length > 0 && (
          <div className="today-recipe-suggest">
            <div className="today-recipe-label"><Flame size={12} /> Suggested for tonight</div>
            <button className="today-recipe-btn" onClick={() => onRecipe(recipes[0])}>
              <div>
                <strong>{recipes[0].title}</strong>
                <span>{recipes[0].time} · {recipes[0].matches.length} ingredient{recipes[0].matches.length > 1 ? 's' : ''} from your pantry</span>
              </div>
              <ArrowRight size={15} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

function PantryView({ pantry, setPantry, onModal, onExport, onRecipe, addToCart, cart, onEditItem }: {
  pantry: PantryItem[];
  setPantry: (items: PantryItem[]) => void;
  onModal: (modal: Modal) => void;
  onExport: () => void;
  onRecipe: (recipe: Recipe) => void;
  addToCart: (name: string) => void;
  cart: CartItem[];
  onEditItem: (item: PantryItem) => void;
}) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sortBy, setSortBy] = useState<'soonest' | 'recent'>('soonest');
  const [essentials, setEssentials] = useState(dailyEssentials);
  const [essentialsEditing, setEssentialsEditing] = useState(false);
  const [newEssential, setNewEssential] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [hiddenShoppingIds, setHiddenShoppingIds] = useState<string[]>([]);
  const [editingShoppingId, setEditingShoppingId] = useState<string | null>(null);
  const [shoppingEditValue, setShoppingEditValue] = useState('');
  const [dayMessage, setDayMessage] = useState('');
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!dropdownOpen) return;
    const handler = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [dropdownOpen]);

  const categories = ['All', ...Array.from(new Set(pantry.map((item) => item.category)))];

  const shown = useMemo(() => {
    let filtered = pantry.filter((item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) &&
      (categoryFilter === 'All' || item.category === categoryFilter)
    );
    filtered = [...filtered].sort((a, b) => sortBy === 'soonest' ? a.days - b.days : b.days - a.days);
    return filtered;
  }, [pantry, search, categoryFilter, sortBy]);

  const useSoon = pantry.filter((item) => item.days > 0 && item.days <= 3).length;
  const freshNow = pantry.filter((item) => item.days > 3).length;
  const categoryCount = new Set(pantry.map((item) => item.category)).size;

  const expiringPantryItems = pantry.filter((item) => item.days > 0 && item.days <= 3 && !hiddenShoppingIds.includes(item.id));

  const addEssentialToCart = (name: string) => {
    addToCart(name);
  };

  const startEditPantryItem = (item: PantryItem) => {
    onEditItem(item);
  };

  const addShoppingToCart = (item: string) => {
    addToCart(item);
  };

  const startEditShoppingItem = (item: PantryItem) => {
    setEditingShoppingId(item.id);
    setShoppingEditValue(item.name);
  };

  const saveShoppingItem = () => {
    const trimmed = shoppingEditValue.trim();
    if (editingShoppingId && trimmed) {
      setPantry(pantry.map((item) => item.id === editingShoppingId ? { ...item, name: trimmed } : item));
    }
    setEditingShoppingId(null);
    setShoppingEditValue('');
  };

  const removeShoppingItem = (id: string) => {
    setHiddenShoppingIds((current) => [...current, id]);
  };

  const addEssential = () => {
    const trimmed = newEssential.trim();
    if (trimmed && !essentials.some((item) => item.toLowerCase() === trimmed.toLowerCase())) {
      setEssentials([...essentials, trimmed]);
    }
    setNewEssential('');
  };

  const recipes = useMemo(() => generateRecipes(pantry), [pantry]);

  return (
    <main className="page">
      <div className="hero pantry-hero">
        <div>
          <div className="eyebrow date"><i />{liveDate()}</div>
          <h1>A little less waste.<br /><em>A lot more dinner.</em></h1>
          <p>Your kitchen, at a glance. Know what is ready, what needs love, and what<br className="desktop" /> to make next.</p>
        </div>
        <button className="simulate" onClick={() => {
          setPantry(pantry.map((item) => ({ ...item, days: item.days - 1 })));
          const newlyUrgent = pantry.filter((item) => item.days === 4).map((item) => item.name);
          setDayMessage(newlyUrgent.length > 0
            ? `A day passed · ${newlyUrgent.length} item${newlyUrgent.length > 1 ? 's now need' : ' now needs'} attention`
            : 'A day passed · expiry dates shifted gently');
          window.setTimeout(() => setDayMessage(''), 3200);
        }}>
          <Clock3 size={15} />
          <span>Simulate a day<small>Show what needs attention tomorrow</small></span>
          <ArrowRight size={14} />
        </button>
        {dayMessage && <div className="day-toast"><Check size={14} />{dayMessage}</div>}
      </div>

      <TodaySummary pantry={pantry} recipes={recipes} onRecipe={onRecipe} />

      <div className="stats">
        <Stat icon={<ShoppingCart size={14} />} value={`${pantry.length}`} label="In your pantry" helper="items tracked" />
        <Stat icon={<Zap size={14} />} value={`${useSoon}`} label="Use soon" helper="within three days" />
        <Stat icon={<Check size={14} />} value={`${freshNow}`} label="Fresh for now" helper="more than three days" />
        <Stat icon={<Menu size={14} />} value={`${categoryCount}`} label="Categories" helper="represented here" />
      </div>
      <div className="section-heading">
        <div>
          <div className="eyebrow">YOUR KITCHEN</div>
          <h2>Your pantry</h2>
          <p>Sorted by what deserves your attention first.</p>
        </div>
        <div className="heading-actions">
          <button className="ghost-btn" onClick={onExport}><Download size={13} /> Export</button>
          <button className="ghost-btn" onClick={() => onModal('import')}><Upload size={13} /> Import</button>
          <button className="add-btn" onClick={() => onModal('add')}><Plus size={15} /> Add item</button>
        </div>
      </div>
      <div className="content-grid">
        <div>
          <div className="filterbar">
            <div className="search"><Search size={14} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search your pantry..." /></div>
            <div className="dropdown-wrap" ref={dropdownRef}>
              <button onClick={() => setDropdownOpen(!dropdownOpen)}>{categoryFilter} <ChevronDown size={13} /></button>
              {dropdownOpen && (
                <div className="dropdown-menu">
                  {categories.map((cat) => (
                    <button key={cat} className={cat === categoryFilter ? 'active' : ''} onClick={() => { setCategoryFilter(cat); setDropdownOpen(false); }}>{cat}</button>
                  ))}
                </div>
              )}
            </div>
            <button onClick={() => setSortBy(sortBy === 'soonest' ? 'recent' : 'soonest')}>
              {sortBy === 'soonest' ? 'Soonest first' : 'Latest first'} <ChevronDown size={13} />
            </button>
          </div>
          <div className="showing">{shown.length} items showing</div>
          <div className="pantry-grid">
            {shown.length === 0 ? (
              <div className="empty-state">No items match your search.</div>
            ) : (
              shown.map((item) => (
                <PantryCard key={item.id} item={item} onRemove={() => setPantry(pantry.filter((entry) => entry.id !== item.id))} onEdit={() => startEditPantryItem(item)} />
              ))
            )}
          </div>
        </div>
        <aside className="sidebar">
          <SideCard title="Needs a little attention." accent>
            <div className="attention-list">
              {pantry.filter((item) => item.days > 0 && item.days <= 3).length === 0 ? (
                <div className="empty-attention">Nothing urgent right now.</div>
              ) : (
                pantry.filter((item) => item.days > 0 && item.days <= 3).map((item) => (
                  <div key={item.id}><span>{item.name}</span><em>{item.days} days left</em></div>
                ))
              )}
            </div>
            <button className="orange-btn" onClick={() => {
              const recipes = generateRecipes(pantry);
              if (recipes.length > 0) onRecipe(recipes[0]);
            }}>Find something to make <ArrowRight size={14} /></button>
          </SideCard>
          <SideCard title="Daily essentials.">
            <div className="essential-heading">
              <small className="pill-help">Tap an item to add it to your shop.</small>
              <button className="edit-essentials" onClick={() => setEssentialsEditing(!essentialsEditing)}>{essentialsEditing ? 'Done' : 'Edit'}</button>
            </div>
            <div className="pills">
              {essentials.map((name) => {
                const inCart = cart.some((item) => item.product.name.toLowerCase() === name.toLowerCase());
                return (
                  <span key={name} className={`pill ${inCart ? 'pill-added' : ''}`}>
                    <button onClick={() => addEssentialToCart(name)}>{inCart && <Check size={10} />} {name}</button>
                    {essentialsEditing && <button className="remove-essential" onClick={() => setEssentials(essentials.filter((item) => item !== name))}><X size={10} /></button>}
                  </span>
                );
              })}
            </div>
            {essentialsEditing && (
              <div className="essential-add-row">
                <input value={newEssential} onChange={(event) => setNewEssential(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && addEssential()} placeholder="Add essential..." />
                <button onClick={addEssential}><Plus size={12} /></button>
              </div>
            )}
          </SideCard>
          <SideCard title="Shopping list">
            <div className="shopping-list">
              {expiringPantryItems.length === 0 && (
                <div className="empty-attention">Nothing expiring soon — your list is clear.</div>
              )}
              {expiringPantryItems.map((item) => {
                const isEditing = editingShoppingId === item.id;
                return (
                  <div key={item.id}>
                    {isEditing ? (
                      <div className="shopping-input-row">
                        <input
                          value={shoppingEditValue}
                          onChange={(event) => setShoppingEditValue(event.target.value)}
                          onKeyDown={(event) => event.key === 'Enter' && saveShoppingItem()}
                          autoFocus
                        />
                        <button className="add-shopping" onClick={saveShoppingItem}><Check size={12} /></button>
                      </div>
                    ) : (
                      <>
                        <span>
                          <i />{item.name}
                          <small className="expiring-tag">{item.days}d left</small>
                        </span>
                        <div className="shopping-actions">
                          <button onClick={() => addShoppingToCart(item.name)}>Add</button>
                          <button className="edit" onClick={() => startEditShoppingItem(item)}><Pencil size={10} /></button>
                          <button className="remove" onClick={() => removeShoppingItem(item.id)}><Trash2 size={11} /></button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
              {expiringPantryItems.length > 0 && (
                <button className="add-shopping-btn" onClick={() => expiringPantryItems.forEach((item) => addShoppingToCart(item.name))}>
                  <ShoppingCart size={12} /> Add all to shop
                </button>
              )}
            </div>
          </SideCard>
        </aside>
      </div>
      <div className="ideas">
        <div className="eyebrow">FROM WHAT YOU HAVE</div>
        <h2>Food ideas, minus the scroll.</h2>
        {recipes.length === 0 ? (
          <div className="empty-recipes">Nothing expiring soon — your pantry is in great shape.</div>
        ) : (
          <div className="idea-grid">
            {recipes.map((recipe, index) => (
              <RecipeCard key={index} recipe={recipe} warm={index === 0} onClick={() => onRecipe(recipe)} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function RecipeCard({ recipe, warm, onClick }: { recipe: Recipe; warm: boolean; onClick: () => void }) {
  return (
    <article className={`recipe ${warm ? 'warm' : ''}`}>
      <small>{recipe.time}</small>
      <span>{recipe.matches.length} expiring match{recipe.matches.length > 1 ? 'es' : ''}</span>
      <h3>{recipe.title}</h3>
      <p>{recipe.detail}</p>
      <button className="view-idea" onClick={onClick}>View idea <ArrowRight size={12} /></button>
    </article>
  );
}

function ShopView({ cart, addToCart, removeFromCart, onCheckout, onModal }: {
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (product: Product) => void;
  onCheckout: () => void;
  onModal: (modal: Modal) => void;
}) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', ...Array.from(new Set(products.map((product) => product.category)))];
  const shown = products.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase()) &&
    (activeCategory === 'All' || product.category === activeCategory)
  );

  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.qty, 0);

  return (
    <main className="page shop-page">
      <div className="hero shop-hero">
        <div>
          <div className="eyebrow date"><i />{liveDate()}</div>
          <h1>Stock the room.<br /><em>Keep service moving.</em></h1>
          <p>Business packs, clear quantities, and a reorder rhythm that does not need a<br className="desktop" /> spreadsheet.</p>
        </div>
        <div className="shop-stats">
          <Stat icon={<ShoppingCart size={13} />} value={formatINR(cartTotal)} label="Active cart" helper="" />
          <Stat icon={<Clock3 size={13} />} value="Tomorrow" label="Next delivery" helper="" />
          <Stat icon={<Check size={13} />} value="Delivered" label="Last order" helper="" />
        </div>
      </div>
      <div className="section-heading">
        <div>
          <div className="eyebrow">WHOLESALE SHELF</div>
          <h2>Build the next delivery</h2>
        </div>
        <button className="outline-btn scan" onClick={() => onModal('scan')}><Camera size={14} /> Scan item</button>
      </div>
      <div className="content-grid shop-grid">
        <div>
          <div className="filterbar shop-filter">
            <div className="search"><Search size={14} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search rice, milk, coffee..." /></div>
            <div className="chips">
              {categories.map((cat) => (
                <button key={cat} className={`${cat === activeCategory ? 'selected' : ''} ${cat !== 'All' ? categoryClass(cat) : ''}`} onClick={() => setActiveCategory(cat)}>{cat}</button>
              ))}
            </div>
          </div>
          <div className="product-grid">
            {shown.map((product) => {
              const inCart = cart.find((item) => item.product.name === product.name);
              return (
                <ProductCard
                  key={product.name}
                  product={product}
                  inCart={inCart?.qty || 0}
                  onAdd={() => addToCart(product)}
                  onRemove={() => removeFromCart(product)}
                />
              );
            })}
          </div>
        </div>
        <aside className="basket">
          <div className="eyebrow">BASKET</div>
          <h3>A steady restock.</h3>
          {cart.length === 0 ? (
            <div className="empty-basket"><ShoppingCart size={20} /><strong>Your basket is clear.</strong><span>Add a few items and this space will keep the maths tidy.</span></div>
          ) : (
            <>
              <div className="basket-item-list">
                {cart.map((item) => (
                  <div key={item.product.name} className="basket-row">
                    <span>{item.product.name}</span>
                    <div className="qty-controls">
                      <button onClick={() => removeFromCart(item.product)}>−</button>
                      <b>{item.qty}</b>
                      <button onClick={() => addToCart(item.product)}>+</button>
                    </div>
                    <strong>{formatINR(item.product.price * item.qty)}</strong>
                  </div>
                ))}
              </div>
              <div className="totals">
                <span>Subtotal <b>{formatINR(cartTotal)}</b></span>
                <span>GST estimate <b>₹0</b></span>
                <strong>Total <b>{formatINR(cartTotal)}</b></strong>
              </div>
              <button className="checkout" onClick={onCheckout}>Continue to checkout <ArrowRight size={14} /></button>
            </>
          )}
          <small>Tax is estimated · no payment is processed here</small>
        </aside>
      </div>
    </main>
  );
}

function categoryClass(category: string): string {
  return 'cat-' + category.toLowerCase().replace(/[^a-z]+/g, '-').replace(/^-|-$/g, '');
}

function ProductCard({ product, inCart, onAdd, onRemove }: {
  product: Product;
  inCart: number;
  onAdd: () => void;
  onRemove: () => void;
}) {
  return (
    <article className={`product-card ${categoryClass(product.category)}`}>
      <div className="product-mark">{product.mark}</div>
      <small>{product.category}</small>
      <h3>{product.name}</h3>
      <p>{product.detail}</p>
      <div className="product-bottom">
        <div>
          <span className={`stock ${product.status === 'Low stock' ? 'low' : ''}`}>{product.status || 'In stock'}</span>
          <strong>{formatINR(product.price)}</strong>
        </div>
        {inCart > 0 ? (
          <div className="qty-controls">
            <button onClick={onRemove}>−</button>
            <b>{inCart}</b>
            <button onClick={onAdd}>+</button>
          </div>
        ) : (
          <button className="add-product" onClick={onAdd}><Plus size={13} /> Add</button>
        )}
      </div>
    </article>
  );
}

function OrdersView({ orders, onReorder }: { orders: Order[]; onReorder: (order: Order) => void }) {
  return (
    <main className="page orders-page">
      <div className="hero orders-hero">
        <div>
          <div className="eyebrow date"><i />{liveDate()}</div>
          <h1>Stock the room.<br /><em>Keep service moving.</em></h1>
          <p>Business packs, clear quantities, and a reorder rhythm that does not need a<br className="desktop" /> spreadsheet.</p>
        </div>
        <div className="shop-stats">
          <Stat icon={<ShoppingCart size={13} />} value="₹0" label="Active cart" helper="" />
          <Stat icon={<Clock3 size={13} />} value="Tomorrow" label="Next delivery" helper="" />
          <Stat icon={<Check size={13} />} value="Delivered" label="Last order" helper="" />
        </div>
      </div>
      <div className="section-heading">
        <div>
          <div className="eyebrow">YOUR BUYING RHYTHM</div>
          <h2>Order history</h2>
        </div>
        <span className="saved">{orders.length} saved order{orders.length !== 1 ? 's' : ''}</span>
      </div>
      <div className="orders-list">
        {orders.length === 0 ? (
          <div className="empty-state">No orders yet. Place an order from the Shop to see it here.</div>
        ) : (
          orders.map((order) => (
            <OrderCard key={order.id} order={order} onReorder={() => onReorder(order)} />
          ))
        )}
      </div>
    </main>
  );
}

function OrderCard({ order, onReorder }: { order: Order; onReorder: () => void }) {
  return (
    <article className="order">
      <div className="order-icon"><ShoppingCart size={16} /></div>
      <div>
        <strong>{order.id} <span>Delivered</span></strong>
        <p>{order.date} · {order.contact} · {order.slot}</p>
        <small>{order.items}</small>
      </div>
      <div className="order-total">
        <strong>{formatINR(order.amount)}</strong>
        <button onClick={onReorder}>Reorder <ArrowRight size={13} /></button>
      </div>
    </article>
  );
}

function ExpiryBanner({ expiredItems, onDismiss, onClear }: {
  expiredItems: PantryItem[];
  onDismiss: () => void;
  onClear: () => void;
}) {
  if (expiredItems.length === 0) return null;
  return (
    <div className="expiry-banner">
      <div className="expiry-content">
        <Zap size={16} />
        <div>
          <strong>{expiredItems.length} item{expiredItems.length > 1 ? 's have' : ' has'} expired</strong>
          <span>{expiredItems.map((item) => item.name).join(', ')}</span>
        </div>
      </div>
      <div className="expiry-actions">
        <button className="clear-expired" onClick={onClear}>Remove all</button>
        <button className="dismiss-expired" onClick={onDismiss}><X size={14} /></button>
      </div>
    </div>
  );
}

function EditItemModal({ item, onSave, onClose }: { item: PantryItem; onSave: (item: PantryItem) => void; onClose: () => void }) {
  const [name, setName] = useState(item.name);
  const [amount, setAmount] = useState(item.amount);
  const [days, setDays] = useState(String(item.days));
  const [category, setCategory] = useState(item.category);

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({ ...item, name: name.trim(), amount: amount.trim() || '1 item', days: parseInt(days) || 0, category });
  };

  return (
    <>
      <div className="checkout-form">
        <label className="full">Item name<input value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Avocado" autoFocus /></label>
        <label>Amount<input value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="e.g. 2 pieces" /></label>
        <label>Days until expiry<input value={days} onChange={(event) => setDays(event.target.value)} type="number" placeholder="7" /></label>
        <label className="full">Category
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            <option>Vegetable</option>
            <option>Fruit</option>
            <option>Dairy</option>
            <option>Grains</option>
            <option>Other</option>
          </select>
        </label>
      </div>
      <button className="confirm-btn" onClick={handleSave}><Check size={14} /> Save changes</button>
    </>
  );
}

function ModalView({ modal, close, pantry, setPantry, cart, onPlaceOrder, recipe, editingItem, onSaveEdit }: {
  modal: Exclude<Modal, null>;
  close: () => void;
  pantry: PantryItem[];
  setPantry: (items: PantryItem[]) => void;
  cart: CartItem[];
  onPlaceOrder: (contact: string, slot: string) => void;
  recipe: Recipe | null;
  editingItem: PantryItem | null;
  onSaveEdit: (item: PantryItem) => void;
}) {
  const [code, setCode] = useState('');
  const [cameraOn, setCameraOn] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [scannedCode, setScannedCode] = useState('');
  const [scanStatus, setScanStatus] = useState('');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const barcodeImageRef = useRef<HTMLInputElement | null>(null);
  const detectIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const detectionBusyRef = useRef(false);
  const mountedRef = useRef(true);
  const hasBarcodeDetector = typeof window !== 'undefined' && 'BarcodeDetector' in window;
  const canUseCamera = typeof window !== 'undefined' && (window.isSecureContext || ['localhost', '127.0.0.1'].includes(window.location.hostname)) && Boolean(navigator.mediaDevices?.getUserMedia);

  // Add item form state
  const [newName, setNewName] = useState('');
  const [newAmount, setNewAmount] = useState('1 item');
  const [newDays, setNewDays] = useState('7');
  const [newCategory, setNewCategory] = useState('Other');

  // Checkout form state
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [slot, setSlot] = useState('Morning · 7:00–9:00');
  const [address, setAddress] = useState('');
  const [payment, setPayment] = useState('Invoice on delivery');
  const [formError, setFormError] = useState('');

  const stopCamera = () => {
    if (detectIntervalRef.current) {
      clearInterval(detectIntervalRef.current);
      detectIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraOn(false);
    setScanStatus('');
  };

  const startCamera = async () => {
    setCameraError('');
    setScanStatus('Starting camera...');
    if (!canUseCamera) {
      setCameraError('Camera scanning needs a secure connection and a phone browser with camera access. Enter the barcode manually below.');
      setScanStatus('Manual entry is ready on this device');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      if (!mountedRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      streamRef.current = stream;
      setCameraOn(true);
      setScanStatus('Point at a barcode');
      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.muted = true;
          videoRef.current.setAttribute('playsinline', 'true');
          videoRef.current.play().catch(() => {});
        }
      });
      if (hasBarcodeDetector) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const Detector = (window as any).BarcodeDetector;
          const detector = new Detector({ formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39', 'itf', 'codabar'] });
          detectIntervalRef.current = setInterval(async () => {
            if (!videoRef.current || !streamRef.current || detectionBusyRef.current) return;
            detectionBusyRef.current = true;
            try {
              const barcodes = await detector.detect(videoRef.current);
              if (barcodes && barcodes.length > 0) {
                const detectedValue = barcodes[0].rawValue;
                setScannedCode(detectedValue);
                stopCamera();
                setScanStatus(`Detected: ${detectedValue}`);
              }
            } catch {
              // The video may not have a readable frame yet.
            } finally {
              detectionBusyRef.current = false;
            }
          }, 500);
        } catch {
          setScanStatus('Camera ready — enter the barcode below because automatic reading is unavailable here.');
        }
      } else {
        setScanStatus('Camera preview is ready — automatic reading is not supported in this browser. Enter the code below.');
      }
    } catch {
      setCameraError('Camera access was blocked or unavailable. You can still enter the barcode manually below.');
      setScanStatus('');
      setCameraOn(false);
    }
  };

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      stopCamera();
    };
  }, []);

  const handleScanConfirm = () => {
    const barcode = code || scannedCode;
    if (!barcode) return;
    setPantry([...pantry, {
      id: uid(),
      name: `Scanned item (${barcode.slice(-4)})`,
      amount: '1 item',
      days: 7,
      category: 'Other',
      barcode,
    }]);
    setCode('');
    setScannedCode('');
    stopCamera();
    close();
  };

  const handleBarcodePhoto = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!hasBarcodeDetector) {
      setCameraError('This browser can take a barcode photo but cannot read it automatically. Enter the barcode manually below.');
      return;
    }
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const Detector = (window as any).BarcodeDetector;
      const detector = new Detector({ formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39', 'itf', 'codabar'] });
      const bitmap = await createImageBitmap(file);
      const barcodes = await detector.detect(bitmap);
      bitmap.close();
      if (barcodes.length > 0) {
        setScannedCode(barcodes[0].rawValue);
        setCode(barcodes[0].rawValue);
        setScanStatus(`Detected: ${barcodes[0].rawValue}`);
      } else {
        setCameraError('No barcode was found in that photo. Try again with the barcode centered and well lit.');
      }
    } catch {
      setCameraError('This photo could not be read. Use the live camera or enter the barcode manually.');
    }
  };

  const handleDemoScan = () => {
    const demoCode = '8901234567890';
    setScannedCode(demoCode);
    setCode(demoCode);
    setScanStatus('Demo barcode loaded');
  };

  const handleAddItem = () => {
    if (!newName.trim()) return;
    setPantry([...pantry, {
      id: uid(),
      name: newName.trim(),
      amount: newAmount.trim() || '1 item',
      days: parseInt(newDays) || 7,
      category: newCategory,
    }]);
    setNewName('');
    setNewAmount('1 item');
    setNewDays('7');
    setNewCategory('Other');
    close();
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const imported = parseCSV(text);
      if (imported.length > 0) {
        setPantry([...pantry, ...imported]);
      }
      close();
    };
    reader.readAsText(file);
  };

  const handleCheckout = () => {
    if (!contactName.trim() || !phone.trim() || !address.trim()) {
      setFormError('Please fill in contact name, phone, and delivery address.');
      return;
    }
    onPlaceOrder(contactName.trim(), slot);
    setContactName('');
    setPhone('');
    setAddress('');
    setFormError('');
    close();
  };

  const scanMarkup = (
    <>
      <div className="notice"><Camera size={13} /> Use your phone camera to scan a barcode. Camera access stays on this device and nothing is uploaded.</div>
      <div className="camera-box">
        {cameraOn ? (
          <video ref={(node) => { videoRef.current = node; }} playsInline autoPlay muted />
        ) : (
          <div className="camera-placeholder"><Camera size={28} /><strong>Your camera is off</strong><span>Nothing is recorded or uploaded.</span></div>
        )}
        <div className="scan-frame" />
      </div>
      {cameraError && <div className="camera-error">{cameraError}</div>}
      {scanStatus && <div className="scan-status">{scanStatus}</div>}
      {!cameraOn ? (
        <button className="start-camera" onClick={startCamera}><Camera size={14} /> Start camera</button>
      ) : (
        <button className="start-camera stop" onClick={stopCamera}><X size={14} /> Stop camera</button>
      )}
      <label>Or enter barcode manually</label>
      <div className="code-row">
        <input value={code} onChange={(event) => setCode(event.target.value)} placeholder="e.g. 8901234567890" />
        <button className="use-code" onClick={handleScanConfirm}>Save to pantry</button>
      </div>
      {hasBarcodeDetector && (
        <>
          <button className="demo-scan" onClick={() => barcodeImageRef.current?.click()}><Camera size={13} /> Take a barcode photo instead</button>
          <input ref={barcodeImageRef} type="file" accept="image/*" capture="environment" onChange={handleBarcodePhoto} style={{ display: 'none' }} />
        </>
      )}
      <button className="demo-scan" onClick={handleDemoScan}>Use demo barcode</button>
      <small className="help">Automatic reading works in supported phone browsers. If your browser does not support it, the live camera preview and manual entry are still available.</small>
      <button className="close-scanner" onClick={() => { stopCamera(); close(); }}>Close scanner</button>
    </>
  );

  const addMarkup = (
    <>
      <div className="checkout-form">
        <label className="full">Item name<input value={newName} onChange={(event) => setNewName(event.target.value)} placeholder="e.g. Avocado" autoFocus /></label>
        <label>Amount<input value={newAmount} onChange={(event) => setNewAmount(event.target.value)} placeholder="e.g. 2 pieces" /></label>
        <label>Days until expiry<input value={newDays} onChange={(event) => setNewDays(event.target.value)} type="number" placeholder="7" /></label>
        <label className="full">Category
          <select value={newCategory} onChange={(event) => setNewCategory(event.target.value)}>
            <option>Vegetable</option>
            <option>Fruit</option>
            <option>Dairy</option>
            <option>Grains</option>
            <option>Other</option>
          </select>
        </label>
      </div>
      <button className="confirm-btn" onClick={handleAddItem}><Plus size={14} /> Add to pantry</button>
    </>
  );

  const editMarkup = editingItem && (
    <EditItemModal item={editingItem} onSave={(updated) => { onSaveEdit(updated); close(); }} onClose={close} />
  );

  const checkoutMarkup = (
    <>
      <div className="notice">A local order note will be saved on this device. FreshTrack does not process payment or call a live inventory service.</div>
      {formError && <div className="camera-error">{formError}</div>}
      <div className="checkout-form">
        <label>Business name<input defaultValue="Juniper House" /></label>
        <label>Contact name<input value={contactName} onChange={(event) => setContactName(event.target.value)} placeholder="Your name" /></label>
        <label>Phone<input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Phone number" /></label>
        <label>Delivery slot<select value={slot} onChange={(event) => setSlot(event.target.value)}><option>Morning · 7:00–9:00</option><option>Afternoon · 12:00–15:00</option></select></label>
        <label className="full">Delivery address<textarea value={address} onChange={(event) => setAddress(event.target.value)} placeholder="Floor, building, street, landmark" /></label>
      </div>
      <div className="payment">
        <span>Payment method</span>
        <button className={payment === 'Cash on delivery' ? 'chosen' : ''} onClick={() => setPayment('Cash on delivery')}>Cash on delivery</button>
        <button className={payment === 'Invoice on delivery' ? 'chosen' : ''} onClick={() => setPayment('Invoice on delivery')}>Invoice on delivery</button>
      </div>
      <div className="checkout-summary">
        <span>Items: {cart.reduce((sum, item) => sum + item.qty, 0)}</span>
        <strong>Total: {formatINR(cart.reduce((sum, item) => sum + item.product.price * item.qty, 0))}</strong>
      </div>
      <button className="confirm-btn" onClick={handleCheckout}>Confirm delivery <ArrowRight size={14} /></button>
      <small className="help center">Review your delivery details before confirming.</small>
    </>
  );

  const importMarkup = (
    <>
      <div className="upload-zone">
        <div className="upload-icon"><FileUp size={17} /></div>
        <strong>Import a CSV</strong>
        <p>Use columns for name, quantity, unit, daysRemaining, and category. Your current pantry stays safe — imported items are added alongside it.</p>
        <button onClick={() => fileRef.current?.click()}><Upload size={13} /> Choose CSV file</button>
        <input ref={fileRef} type="file" accept=".csv" onChange={handleImport} style={{ display: 'none' }} />
      </div>
      <div className="modal-footer"><small>Need a template?</small><button className="link-btn" onClick={() => downloadCSV('freshtrack-template.csv', 'name,quantity,unit,daysRemaining,category,barcode\n"Bananas","6 pieces","","5","Fruit",""\n"Milk","1 litre","","3","Dairy",""')}>Download one</button></div>
    </>
  );

  const recipeMarkup = recipe && (
    <>
      <div className="recipe-detail">
        <div className="recipe-detail-header">
          <small>{recipe.time}</small>
          <span>{recipe.matches.length} expiring match{recipe.matches.length > 1 ? 'es' : ''}</span>
        </div>
        <h3>{recipe.title}</h3>
        <p>{recipe.detail}</p>
        <div className="recipe-matches">
          <strong>Using expiring items:</strong>
          <div className="match-pills">
            {recipe.matches.map((match) => <span key={match}>{match}</span>)}
          </div>
        </div>
        <div className="recipe-steps">
          <strong>Quick steps:</strong>
          <ol>
            <li>Check your pantry for the listed ingredients.</li>
            <li>Wash, chop, and prep everything before you start cooking.</li>
            <li>Cook using your preferred method — this is a flexible, low-waste idea, not a strict recipe.</li>
            <li>Season to taste and serve immediately.</li>
          </ol>
        </div>
      </div>
      <button className="confirm-btn" onClick={close}>Got it <Check size={14} /></button>
    </>
  );

  const titles: Record<string, string> = {
    scan: 'Scan with your phone',
    checkout: 'Confirm this delivery',
    import: 'Bring in your pantry',
    add: 'Add pantry item',
    edit: 'Edit pantry item',
    recipe: 'Recipe idea',
  };

  return (
    <div className="modal-backdrop" onClick={() => { stopCamera(); close(); }}>
      <div className={`modal ${modal === 'checkout' ? 'checkout-modal' : ''} ${modal === 'recipe' ? 'recipe-modal' : ''}`} onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <h2>{titles[modal]}</h2>
          <button onClick={() => { stopCamera(); close(); }}><X size={14} /></button>
        </div>
        {modal === 'scan' && scanMarkup}
        {modal === 'add' && addMarkup}
        {modal === 'edit' && editMarkup}
        {modal === 'checkout' && checkoutMarkup}
        {modal === 'import' && importMarkup}
        {modal === 'recipe' && recipeMarkup}
      </div>
    </div>
  );
}

function App() {
  const persisted = useRef(loadState());

  const [view, setView] = useState<View>('pantry');
  const [modal, setModal] = useState<Modal>(null);
  const [pantry, setPantry] = useState<PantryItem[]>(persisted.current.pantry ?? initialPantry);
  const [cart, setCart] = useState<CartItem[]>(persisted.current.cart ?? []);
  const [orders, setOrders] = useState<Order[]>(persisted.current.orders ?? [
    { id: 'FT-240417', date: '17 Apr 2024', amount: 1780, items: 'House filter coffee × 1 · Full cream milk × 1', slot: 'Morning · 7:00–9:00', contact: 'Juniper House' },
    { id: 'FT-240412', date: '12 Apr 2024', amount: 1060, items: 'Basmati rice × 1 · Farm eggs × 2', slot: 'Morning · 7:00–9:00', contact: 'Juniper House' },
  ]);
  const [started, setStarted] = useState(persisted.current.started ?? false);
  const [dark, setDark] = useState(persisted.current.dark ?? false);
  const [expiryDismissed, setExpiryDismissed] = useState(false);
  const [activeRecipe, setActiveRecipe] = useState<Recipe | null>(null);
  const [editingItem, setEditingItem] = useState<PantryItem | null>(null);

  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const expiredItems = pantry.filter((item) => item.days <= 0);

  // Persist to localStorage whenever relevant state changes
  useEffect(() => {
    saveState({ pantry, cart, orders, started, dark, essentials: dailyEssentials });
  }, [pantry, cart, orders, started, dark]);

  useEffect(() => {
    document.body.classList.toggle('dark', dark);
  }, [dark]);

  useEffect(() => {
    setExpiryDismissed(false);
  }, [pantry]);

  const addToCart = (product: Product) => {
    const existing = cart.find((item) => item.product.name === product.name);
    if (existing) {
      setCart(cart.map((item) =>
        item.product.name === product.name ? { ...item, qty: item.qty + 1 } : item
      ));
    } else {
      setCart([...cart, { product, qty: 1 }]);
    }
  };

  const addByNameToCart = (name: string) => {
    const existingProduct = products.find((product) => product.name.toLowerCase() === name.toLowerCase());
    if (existingProduct) {
      addToCart(existingProduct);
    } else {
      const newProduct: Product = {
        name,
        category: 'Shopping list',
        detail: 'Added from shopping list',
        price: 0,
        mark: name.slice(0, 2).toUpperCase(),
      };
      addToCart(newProduct);
    }
  };

  const removeFromCart = (product: Product) => {
    const existing = cart.find((item) => item.product.name === product.name);
    if (!existing) return;
    if (existing.qty <= 1) {
      setCart(cart.filter((item) => item.product.name !== product.name));
    } else {
      setCart(cart.map((item) =>
        item.product.name === product.name ? { ...item, qty: item.qty - 1 } : item
      ));
    }
  };

  const placeOrder = (contact: string, slot: string) => {
    const order: Order = {
      id: `FT-${Date.now().toString().slice(-6)}`,
      date: new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date()),
      amount: cart.reduce((sum, item) => sum + item.product.price * item.qty, 0),
      items: cart.map((item) => `${item.product.name} × ${item.qty}`).join(' · '),
      slot,
      contact: contact || 'Juniper House',
    };
    setOrders([order, ...orders]);
    setCart([]);
    setView('orders');
  };

  const handleReorder = (order: Order) => {
    order.items.split(' · ').forEach((itemStr) => {
      const name = itemStr.split(' × ')[0].trim();
      const product = products.find((product) => product.name === name);
      if (product) {
        const qty = parseInt(itemStr.split(' × ')[1]) || 1;
        for (let i = 0; i < qty; i++) addToCart(product);
      }
    });
    setView('shop');
  };

  const handleExport = () => {
    downloadCSV('freshtrack-pantry.csv', pantryToCSV(pantry));
  };

  const openEditModal = (item: PantryItem) => {
    setEditingItem(item);
    setModal('edit');
  };

  const saveEditedItem = (updated: PantryItem) => {
    setPantry(pantry.map((item) => item.id === updated.id ? updated : item));
    setEditingItem(null);
  };

  if (!started) return <WelcomeView onStart={() => setStarted(true)} />;

  return (
    <>
      <Header
        view={view}
        setView={setView}
        onModal={setModal}
        cartCount={cartCount}
        dark={dark}
        toggleDark={() => setDark(!dark)}
      />
      {!expiryDismissed && expiredItems.length > 0 && (
        <ExpiryBanner
          expiredItems={expiredItems}
          onDismiss={() => setExpiryDismissed(true)}
          onClear={() => setPantry(pantry.filter((item) => item.days > 0))}
        />
      )}
      {view === 'pantry' && (
        <PantryView
          pantry={pantry}
          setPantry={setPantry}
          onModal={setModal}
          onExport={handleExport}
          onRecipe={(recipe) => { setActiveRecipe(recipe); setModal('recipe'); }}
          addToCart={addByNameToCart}
          cart={cart}
          onEditItem={openEditModal}
        />
      )}
      {view === 'shop' && (
        <ShopView
          cart={cart}
          addToCart={addToCart}
          removeFromCart={removeFromCart}
          onCheckout={() => setModal('checkout')}
          onModal={setModal}
        />
      )}
      {view === 'orders' && <OrdersView orders={orders} onReorder={handleReorder} />}
      {modal && (
        <ModalView
          modal={modal}
          close={() => setModal(null)}
          pantry={pantry}
          setPantry={setPantry}
          cart={cart}
          onPlaceOrder={placeOrder}
          recipe={activeRecipe}
          editingItem={editingItem}
          onSaveEdit={saveEditedItem}
        />
      )}
      {/* Floating add button on mobile */}
      {view === 'pantry' && (
        <button className="fab" onClick={() => setModal('add')} aria-label="Add pantry item">
          <Plus size={24} />
        </button>
      )}
    </>
  );
}

export default App;
