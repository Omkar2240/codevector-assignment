"use client";

import { useState, useEffect, useCallback } from "react";

interface Product {
  id: string;
  name: string;
  category: string;
  price: string;
  created_at: string;
  updated_at: string;
}

interface Cursor {
  createdAt: string;
  id: string;
}

const CATEGORIES = [
  "Electronics",
  "Clothing",
  "Books",
  "Sports",
  "Home",
  "Beauty",
  "Toys",
  "Food",
  "Furniture",
  "Automotive",
];

// Helper to get matching gradient for categories
const getCategoryGradient = (category: string) => {
  switch (category) {
    case "Electronics":
      return "from-indigo-500 to-purple-600 text-purple-100";
    case "Clothing":
      return "from-pink-500 to-rose-600 text-rose-100";
    case "Books":
      return "from-amber-500 to-orange-600 text-amber-100";
    case "Sports":
      return "from-emerald-500 to-teal-600 text-emerald-100";
    case "Home":
      return "from-blue-500 to-cyan-600 text-blue-100";
    case "Beauty":
      return "from-fuchsia-400 to-pink-600 text-fuchsia-100";
    case "Toys":
      return "from-yellow-400 to-amber-500 text-yellow-950";
    case "Food":
      return "from-lime-500 to-green-600 text-lime-100";
    case "Furniture":
      return "from-amber-700 to-orange-800 text-amber-100";
    case "Automotive":
      return "from-slate-600 to-zinc-800 text-slate-100";
    default:
      return "from-gray-500 to-slate-600 text-gray-100";
  }
};

// Helper for category custom SVG icons
const renderCategoryIcon = (category: string) => {
  switch (category) {
    case "Electronics":
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      );
    case "Clothing":
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
        </svg>
      );
    case "Books":
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      );
    case "Sports":
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      );
    case "Home":
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      );
    default:
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      );
  }
};

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter and limit states
  const [category, setCategory] = useState<string>("");
  const [limit, setLimit] = useState<number>(20);

  // Pagination states
  const [snapshotTime, setSnapshotTime] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [nextCursor, setNextCursor] = useState<Cursor | null>(null);
  // List of cursors where cursors[i] is the cursor required to fetch page i + 1.
  // Page 1 is fetched with cursor null (cursors[0] = null)
  const [cursors, setCursors] = useState<(Cursor | null)[]>([null]);

  // Seeding states
  const [seedCount, setSeedCount] = useState<number>(1000);
  const [seeding, setSeeding] = useState<boolean>(false);
  const [seedSuccess, setSeedSuccess] = useState<string | null>(null);
  const [seedError, setSeedError] = useState<string | null>(null);

  // Fetch logic wrapped in useCallback
  const loadPage = useCallback(
    async (
      targetPage: number,
      activeCategory: string,
      pageLimit: number,
      currentSnapshot: string | null,
      cursorToUse: Cursor | null
    ) => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (activeCategory) {
          queryParams.append("category", activeCategory);
        }
        queryParams.append("limit", pageLimit.toString());
        if (cursorToUse) {
          queryParams.append("cursorCreatedAt", cursorToUse.createdAt);
          queryParams.append("cursorId", cursorToUse.id);
        }
        if (currentSnapshot) {
          queryParams.append("snapshotTime", currentSnapshot);
        }

        const apiBaseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:4000/api";
        const response = await fetch(`${apiBaseUrl}/products?${queryParams.toString()}`);

        if (!response.ok) {
          throw new Error(`Server returned error: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.success) {
          setProducts(data.products || []);
          setNextCursor(data.nextCursor || null);
          setCurrentPage(targetPage);

          // Update/Set consistent snapshot time
          if (!currentSnapshot) {
            setSnapshotTime(data.snapshotTime);
          }

          // Update cursors list for the next page fetch if not already populated
          setCursors((prevCursors) => {
            const nextCursors = [...prevCursors];
            nextCursors[targetPage] = data.nextCursor || null;
            return nextCursors;
          });

          setError(null);
        } else {
          throw new Error(data.message || "Failed to fetch products");
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message || "An error occurred while fetching products.");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Initial load or filter/limit change
  useEffect(() => {
    // When category or limit changes, reset snapshot, page indicators, and cursors
    setSnapshotTime(null);
    setCursors([null]);
    loadPage(1, category, limit, null, null);
  }, [category, limit, loadPage]);

  // Handle Next Page click
  const handleNextPage = () => {
    if (!nextCursor || loading) return;
    loadPage(currentPage + 1, category, limit, snapshotTime, nextCursor);
  };

  // Handle Previous Page click
  const handlePrevPage = () => {
    if (currentPage <= 1 || loading) return;
    const prevCursor = cursors[currentPage - 2]; // cursor for page (currentPage - 1)
    loadPage(currentPage - 1, category, limit, snapshotTime, prevCursor);
  };

  // Handle manual Refresh of snapshot consistency lock
  const handleRefresh = () => {
    setSnapshotTime(null);
    setCursors([null]);
    loadPage(1, category, limit, null, null);
  };

  // Handle database seeding
  const handleSeed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (seeding || seedCount <= 0) return;

    setSeeding(true);
    setSeedSuccess(null);
    setSeedError(null);

    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:4000/api";
      const response = await fetch(`${apiBaseUrl}/seed`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ count: seedCount }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to seed products");
      }

      if (data.success) {
        setSeedSuccess(`Successfully seeded ${data.count} products!`);
        // Refresh products after seeding
        handleRefresh();
      } else {
        throw new Error(data.message || "Failed to seed products");
      }
    } catch (err: any) {
      console.error(err);
      setSeedError(err.message || "An error occurred while seeding.");
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="flex-1 bg-zinc-950 text-zinc-100 font-sans min-h-screen pb-16 selection:bg-indigo-500 selection:text-white">
      {/* Background glowing gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full filter blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full filter blur-3xl pointer-events-none" />

      {/* Header Container */}
      <header className="sticky top-0 z-30 backdrop-blur-md bg-zinc-950/80 border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
                AetherStore
              </h1>
              <p className="text-xs text-zinc-500 font-medium">Consistent Infinite Catalog</p>
            </div>
          </div>

          {/* Quick stats / snapshot indicator */}
          <div className="hidden sm:flex items-center gap-4 text-xs">
            {snapshotTime && (
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Consistent Snapshot: {new Date(snapshotTime).toLocaleTimeString()}</span>
              </div>
            )}
            <button
              onClick={handleRefresh}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all duration-200 cursor-pointer"
              title="Release consistency lock and fetch new snapshot"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H17" />
              </svg>
              Refresh
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Seeding Control Card */}
        <section className="mb-8 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5 relative overflow-hidden backdrop-blur-md">
          {/* Subtle glowing decoration */}
          <div className="absolute -top-12 -right-12 w-24 h-24 bg-indigo-500/10 rounded-full filter blur-xl pointer-events-none" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-indigo-400">Database Seeding</h2>
              <h3 className="text-lg font-bold text-white">Generate Mock Catalog Data</h3>
              <p className="text-xs text-zinc-500 max-w-md">
                Dynamically seed products into the database. The seeded products will be distributed across various categories with randomized prices and dates.
              </p>
            </div>
            
            <form onSubmit={handleSeed} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-3 py-2 rounded-xl focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition-all">
                <label htmlFor="seedCountInput" className="text-xs text-zinc-500 font-medium">Count</label>
                <input
                  id="seedCountInput"
                  type="number"
                  min={1}
                  max={200000}
                  value={seedCount}
                  onChange={(e) => setSeedCount(Math.max(1, parseInt(e.target.value) || 0))}
                  disabled={seeding}
                  className="bg-transparent border-0 text-zinc-100 text-sm font-semibold focus:outline-none focus:ring-0 w-24 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
              
              <button
                type="submit"
                disabled={seeding || seedCount <= 0}
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-sm font-bold text-white transition-all shadow-md shadow-indigo-600/15 disabled:opacity-40 disabled:hover:from-indigo-600 disabled:hover:to-purple-600 disabled:cursor-not-allowed cursor-pointer shrink-0"
              >
                {seeding ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Seeding Database...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Seed Products</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Feedback Messages */}
          {seedSuccess && (
            <div className="mt-4 px-4 py-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-300 text-xs font-medium flex items-center gap-2 animate-fadeIn">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>{seedSuccess}</span>
            </div>
          )}

          {seedError && (
            <div className="mt-4 px-4 py-2.5 rounded-xl border border-red-500/20 bg-red-500/5 text-red-300 text-xs font-medium flex items-center gap-2 animate-fadeIn">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              <span>{seedError}</span>
            </div>
          )}
        </section>

        {/* Categories Bar */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">Filter by Category</h2>
            <span className="text-xs text-zinc-500">200,000+ total items</span>
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
            <button
              onClick={() => setCategory("")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all shrink-0 cursor-pointer ${
                category === ""
                  ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/15"
                  : "bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:bg-zinc-900 hover:border-zinc-700 hover:text-zinc-200"
              }`}
            >
              <span>All Products</span>
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all shrink-0 cursor-pointer ${
                  category === cat
                    ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/15"
                    : "bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:bg-zinc-900 hover:border-zinc-700 hover:text-zinc-200"
                }`}
              >
                {renderCategoryIcon(cat)}
                <span>{cat}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Toolbar (Controls & Info) */}
        <section className="mb-6 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Active status metrics */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <div>
              <span className="text-xs text-zinc-500 block">Current Page</span>
              <span className="text-lg font-bold text-zinc-100">{currentPage}</span>
            </div>
            <div className="w-px h-8 bg-zinc-800 hidden sm:block" />
            <div>
              <span className="text-xs text-zinc-500 block">Showing</span>
              <span className="text-lg font-bold text-zinc-100">{products.length} products</span>
            </div>
            <div className="w-px h-8 bg-zinc-800 hidden sm:block" />
            <div>
              <span className="text-xs text-zinc-500 block">Active Filter</span>
              <span className="text-sm font-semibold text-indigo-400">
                {category || "None (All categories)"}
              </span>
            </div>
          </div>

          {/* Config Controls */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-3 py-2 rounded-xl">
              <label htmlFor="limit" className="text-xs text-zinc-400 font-medium">Show</label>
              <select
                id="limit"
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="bg-transparent border-0 text-zinc-100 text-xs font-semibold focus:outline-none focus:ring-0 cursor-pointer"
              >
                <option value={10}>10 Items</option>
                <option value={20}>20 Items</option>
                <option value={50}>50 Items</option>
                <option value={100}>100 Items</option>
              </select>
            </div>

            {/* Mobile Refresh Button */}
            <button
              onClick={handleRefresh}
              className="sm:hidden flex items-center justify-center p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
              title="Refresh Snapshot"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H17" />
              </svg>
            </button>
          </div>
        </section>

        {/* Error State */}
        {error && (
          <div className="mb-8 p-4 rounded-xl border border-red-500/20 bg-red-500/5 text-red-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="font-semibold text-sm">Failed to load products</p>
                <p className="text-xs text-red-400/90">{error}</p>
              </div>
            </div>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 hover:bg-red-500 hover:text-white transition-all text-xs font-semibold cursor-pointer"
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* Products Grid / Skeletons */}
        <section className="mb-8">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array.from({ length: limit }).map((_, i) => (
                <div
                  key={i}
                  className="bg-zinc-900/30 border border-zinc-800/80 rounded-2xl p-4 flex flex-col justify-between h-72 animate-pulse"
                >
                  <div className="space-y-3">
                    {/* Header bar placeholder */}
                    <div className="h-28 rounded-xl bg-zinc-800/60 w-full" />
                    {/* Title placeholder */}
                    <div className="h-4 bg-zinc-800/60 rounded-md w-3/4" />
                    {/* Subtitle placeholder */}
                    <div className="h-3 bg-zinc-800/60 rounded-md w-1/2" />
                  </div>
                  {/* Footer placeholder */}
                  <div className="flex justify-between items-center pt-4 border-t border-zinc-800/50">
                    <div className="h-5 bg-zinc-800/60 rounded-md w-1/3" />
                    <div className="h-4 bg-zinc-800/60 rounded-md w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 bg-zinc-900/10 border border-zinc-800/50 rounded-2xl">
              <svg className="w-12 h-12 text-zinc-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <h3 className="text-lg font-semibold text-zinc-300">No products found</h3>
              <p className="text-sm text-zinc-500 mt-1">Try selecting a different category filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <article
                  key={product.id}
                  className="group relative bg-zinc-900/40 border border-zinc-800/60 hover:border-zinc-700/80 rounded-2xl p-4 flex flex-col justify-between h-72 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/5"
                >
                  <div className="space-y-4">
                    {/* Visual Card Header */}
                    <div className={`relative h-28 rounded-xl bg-gradient-to-br ${getCategoryGradient(product.category)} overflow-hidden flex items-center justify-center p-4`}>
                      {/* Grid background mask for a premium feel */}
                      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:14px_24px] opacity-30" />
                      
                      <div className="text-center z-10">
                        <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-zinc-950/40 backdrop-blur-sm">
                          {product.category}
                        </span>
                      </div>

                      {/* Small visual floating design elements */}
                      <div className="absolute bottom-2 right-2 opacity-10 group-hover:scale-110 transition-transform duration-300">
                        {renderCategoryIcon(product.category)}
                      </div>
                    </div>

                    {/* Product Metadata */}
                    <div>
                      <h3 className="font-bold text-zinc-100 group-hover:text-white transition-colors line-clamp-1">
                        {product.name}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-1 text-[11px] text-zinc-500">
                        <span>Added:</span>
                        <time dateTime={product.created_at} className="font-medium text-zinc-400">
                          {new Date(product.created_at).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </time>
                      </div>
                    </div>
                  </div>

                  {/* Pricing and Details Footer */}
                  <div className="flex justify-between items-center pt-3 border-t border-zinc-800/60">
                    <span className="text-lg font-black text-white">
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                      }).format(Number(product.price))}
                    </span>
                    <span className="text-[9px] font-mono text-zinc-600 block line-clamp-1 uppercase max-w-[80px]" title={`ID: ${product.id}`}>
                      {product.id.split("-")[0]}...
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Pagination Bar */}
        {!error && products.length > 0 && (
          <section className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-zinc-800/80 pt-6">
            <span className="text-xs text-zinc-500">
              Page <span className="font-semibold text-zinc-300">{currentPage}</span> of catalog view
            </span>

            <div className="flex items-center gap-3">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1 || loading}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900 text-sm font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white disabled:opacity-40 disabled:hover:bg-zinc-900 disabled:hover:text-zinc-300 transition-all cursor-pointer disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </button>

              <button
                onClick={handleNextPage}
                disabled={!nextCursor || loading}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900 text-sm font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white disabled:opacity-40 disabled:hover:bg-zinc-900 disabled:hover:text-zinc-300 transition-all cursor-pointer disabled:cursor-not-allowed"
              >
                Next
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </section>
        )}

      </main>
    </div>
  );
}
