import { useMemo, useState } from 'react';
import sourceData from '../data.json';

const normalize = (value = '') => value.toLowerCase().replace(/\s+/g, ' ').trim();

const getRecordKey = (item) => `${item.name || 'unknown'}-${item.link || 'unknown'}`;

const normalizeLink = (rawLink = '') => {
  if (!rawLink) return '#';

  const trimmed = String(rawLink).trim();
  const withoutQuotes = trimmed.replace(/^['\"]|['\"]$/g, '');
  const cleaned = withoutQuotes.replace(/\s+/g, '').replace(/\u00a0/g, '');

  if (!cleaned) return '#';

  if (/^https?:\/\//i.test(cleaned) || /^mailto:/i.test(cleaned) || /^tel:/i.test(cleaned)) {
    return cleaned;
  }

  if (cleaned.startsWith('//')) {
    return `https:${cleaned}`;
  }

  if (/^(?:[a-z0-9-]+\.)+[a-z]{2,}(?:\/.*)?$/i.test(cleaned)) {
    return `https://${cleaned}`;
  }

  if (cleaned.includes('.') && !/^\w+\s/.test(cleaned)) {
    return `https://${cleaned.replace(/^\/+/, '')}`;
  }

  return `https://${cleaned.replace(/^\/+/, '')}`;
};

const getSafeLink = (link = '') => {
  const normalized = normalizeLink(link);
  if (!normalized || normalized === '#') return '#';
  return normalized;
};

const statusStyles = {
  Works: 'border-emerald-400/40 bg-emerald-500/10 text-emerald-300',
  "Doesn't work": 'border-rose-400/40 bg-rose-500/10 text-rose-300',
};

export default function App() {
  const [entries, setEntries] = useState(sourceData);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showAdmin, setShowAdmin] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [selectedKey, setSelectedKey] = useState(getRecordKey(sourceData[0] ?? { name: '', link: '' }));

  const configuredAdminPassword = (import.meta.env.VITE_ADMIN_PASSWORD || '').trim();

  const categories = useMemo(
    () => ['All', ...new Set(entries.map((item) => item.category).filter(Boolean))],
    [entries],
  );

  const filteredEntries = useMemo(() => {
    const normalizedQuery = normalize(query);

    return entries.filter((item) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        [item.name, item.link, item.category, item.notes, item.added_by, item.status]
          .filter(Boolean)
          .some((value) => normalize(String(value)).includes(normalizedQuery));

      const matchesCategory = category === 'All' || item.category === category;
      const matchesStatus =
        statusFilter === 'All' ||
        (statusFilter === 'Works' ? item.works : !item.works);

      return matchesQuery && matchesCategory && matchesStatus;
    });
  }, [entries, query, category, statusFilter]);

  const worksCount = entries.filter((item) => item.works).length;
  const brokenCount = entries.length - worksCount;

  const selectedItem = entries.find((item) => getRecordKey(item) === selectedKey) ?? entries[0] ?? null;

  const handleAdminAccess = (event) => {
    event.preventDefault();

    if (!configuredAdminPassword) {
      setAuthError('No VITE_ADMIN_PASSWORD was configured for this app.');
      setIsAdmin(false);
      return;
    }

    if (passwordInput === configuredAdminPassword) {
      setIsAdmin(true);
      setAuthError('');
      setShowAdmin(true);
      return;
    }

    setAuthError('Incorrect password.');
    setIsAdmin(false);
  };

  const updateEntry = (recordKey, changes) => {
    setEntries((currentEntries) =>
      currentEntries.map((item) => {
        if (getRecordKey(item) !== recordKey) {
          return item;
        }

        const updatedItem = { ...item, ...changes };

        if (typeof changes.works !== 'undefined') {
          updatedItem.status = changes.works ? 'Works' : "Doesn't work";
        }

        return updatedItem;
      }),
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8 rounded-3xl border border-slate-800/80 bg-slate-900/70 p-6 shadow-glow backdrop-blur-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">Public portal</p>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">Media Hub</h1>
            </div>

            <button
              type="button"
              onClick={() => setShowAdmin((current) => !current)}
              className="inline-flex items-center justify-center rounded-full border border-cyan-400/50 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-200 transition hover:border-cyan-300 hover:bg-cyan-500/20"
            >
              {showAdmin ? 'Hide admin' : 'Admin access'}
            </button>
          </div>
        </header>

        {showAdmin && (
          <section className="mb-8 rounded-3xl border border-slate-800 bg-slate-900/75 p-5 shadow-glow">
            {!isAdmin ? (
              <form onSubmit={handleAdminAccess} className="space-y-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">Protected admin</p>
                  <h2 className="mt-2 text-xl font-bold text-white">Unlock edit controls</h2>
                </div>

                <div className="flex flex-col gap-3 md:flex-row">
                  <input
                    type="password"
                    value={passwordInput}
                    onChange={(event) => setPasswordInput(event.target.value)}
                    placeholder="Enter admin password"
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
                  />

                  <button
                    type="submit"
                    className="rounded-2xl bg-cyan-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300"
                  >
                    Verify
                  </button>
                </div>

                {authError ? <p className="text-sm text-rose-300">{authError}</p> : null}
              </form>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">Admin mode</p>
                    <h2 className="mt-2 text-xl font-bold text-white">Protected edit console</h2>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIsAdmin(false);
                      setPasswordInput('');
                    }}
                    className="rounded-full border border-slate-700 px-3 py-2 text-sm text-slate-200 transition hover:border-slate-500 hover:bg-slate-800"
                  >
                    Sign out
                  </button>
                </div>

                {selectedItem ? (
                  <div className="grid gap-4 rounded-2xl border border-slate-800 bg-slate-950/70 p-4 md:grid-cols-[1.1fr_2fr]">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Selected record</label>
                      <select
                        value={selectedKey}
                        onChange={(event) => setSelectedKey(event.target.value)}
                        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-white outline-none focus:border-cyan-400"
                      >
                        {entries.map((item) => (
                          <option key={getRecordKey(item)} value={getRecordKey(item)}>
                            {item.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-3">
                      <div className="grid gap-3 md:grid-cols-2">
                        <label className="space-y-2 text-sm font-medium text-slate-300">
                          <span>Status</span>
                          <select
                            value={String(selectedItem.works)}
                            onChange={(event) => {
                              const nextWorks = event.target.value === 'true';
                              updateEntry(selectedKey, { works: nextWorks, status: nextWorks ? 'Works' : "Doesn't work" });
                            }}
                            className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-white outline-none focus:border-cyan-400"
                          >
                            <option value="true">Works</option>
                            <option value="false">Doesn't work</option>
                          </select>
                        </label>

                        <label className="space-y-2 text-sm font-medium text-slate-300">
                          <span>Ease of use</span>
                          <input
                            type="number"
                            min="0"
                            max="5"
                            value={selectedItem.ease_of_use ?? 0}
                            onChange={(event) =>
                              updateEntry(selectedKey, {
                                ease_of_use: Number(event.target.value) || 0,
                              })
                            }
                            className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-white outline-none focus:border-cyan-400"
                          />
                        </label>
                      </div>

                      <label className="block space-y-2 text-sm font-medium text-slate-300">
                        <span>Notes</span>
                        <textarea
                          rows="4"
                          value={selectedItem.notes ?? ''}
                          onChange={(event) =>
                            updateEntry(selectedKey, {
                              notes: event.target.value,
                            })
                          }
                          className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-white outline-none focus:border-cyan-400"
                        />
                      </label>
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </section>
        )}

        <section className="mb-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-glow">
            <p className="text-sm uppercase tracking-[0.18em] text-slate-400">Total</p>
            <p className="mt-3 text-3xl font-black text-white">{entries.length}</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-emerald-500/10 p-4 shadow-glow">
            <p className="text-sm uppercase tracking-[0.18em] text-emerald-200">Working</p>
            <p className="mt-3 text-3xl font-black text-white">{worksCount}</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-rose-500/10 p-4 shadow-glow">
            <p className="text-sm uppercase tracking-[0.18em] text-rose-200">Broken</p>
            <p className="mt-3 text-3xl font-black text-white">{brokenCount}</p>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 shadow-glow">
          <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex w-full flex-col gap-3 lg:max-w-2xl lg:flex-row">
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by name, category, notes, or user"
                className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
              />

              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
              >
                {categories.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
              >
                <option value="All">All status</option>
                <option value="Works">Works</option>
                <option value="Doesn't work">Doesn't work</option>
              </select>
            </div>
          </div>

          <div className="mb-3 flex items-center justify-between text-sm text-slate-400">
            <span>{filteredEntries.length} records shown</span>
            <span>Guests read-only</span>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredEntries.length > 0 ? (
              filteredEntries.map((item) => {
                const link = getSafeLink(item.link);

                return (
                  <article
                    key={getRecordKey(item)}
                    className="group flex h-full flex-col rounded-2xl border border-slate-800 bg-slate-950/60 p-4 transition hover:-translate-y-0.5 hover:border-cyan-400/60 hover:bg-slate-950/80"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-cyan-300">{item.category || 'General'}</p>
                        <h3 className="mt-2 text-xl font-bold text-white">{item.name}</h3>
                      </div>

                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statusStyles[item.status] || statusStyles["Doesn't work"]}`}
                      >
                        {item.status || (item.works ? 'Works' : "Doesn't work")}
                      </span>
                    </div>

                    <p className="mt-4 break-all text-sm text-slate-300">{item.link}</p>

                    <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-300">
                      <span className="rounded-full border border-slate-700 bg-slate-900 px-2.5 py-1">
                        Ease {item.ease_of_use ?? 0}/5
                      </span>
                      <span className="rounded-full border border-slate-700 bg-slate-900 px-2.5 py-1">
                        {item.added_by || 'Community'}
                      </span>
                      {item.date_checked ? (
                        <span className="rounded-full border border-slate-700 bg-slate-900 px-2.5 py-1">
                          {item.date_checked}
                        </span>
                      ) : null}
                    </div>

                    {item.notes ? <p className="mt-4 text-sm leading-6 text-slate-300">{item.notes}</p> : null}

                    <div className="mt-auto flex items-center justify-between gap-3 pt-4">
                      <a
                        href={link}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center rounded-full bg-cyan-400 px-3.5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
                      >
                        Open link
                      </a>

                      {link !== '#' ? (
                        <a
                          href={link}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-medium text-slate-300 underline-offset-2 hover:text-cyan-300 hover:underline"
                        >
                          Visit site
                        </a>
                      ) : null}
                    </div>
                  </article>
                );
              })
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-950/40 p-8 text-center text-slate-300 md:col-span-2 xl:col-span-3">
                No records match your current search. Try a different keyword or filter.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
