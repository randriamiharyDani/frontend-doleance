import React, { useMemo, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell,
  ResponsiveContainer, LabelList
} from 'recharts';

const FALLBACK_SCALE = ['#1B2A4A', '#2E4468', '#4A6389', '#7C93B3', '#A8B9D1', '#D4AF37'];

function CustomTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const item = payload[0].payload;
  return (
    <div className="rounded-xl border border-gray-200 bg-white/95 backdrop-blur-sm p-3.5 shadow-xl dark:border-slate-700 dark:bg-slate-800/95 min-w-[170px]">
      <p className="mb-1.5 text-sm font-semibold text-gray-800 dark:text-gray-100">
        {item.nom_categorie}
      </p>
      <div className="flex items-center justify-between gap-4 text-sm">
        <span className="text-gray-500 dark:text-gray-400">Doléances</span>
        <span className="font-bold text-gray-900 dark:text-gray-50">{item.count}</span>
      </div>
      <div className="flex items-center justify-between gap-4 text-sm">
        <span className="text-gray-500 dark:text-gray-400">Part du total</span>
        <span className="font-bold" style={{ color: '#D4AF37' }}>{item.pct}%</span>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex h-[320px] flex-col items-center justify-center gap-2 text-gray-400 dark:text-gray-500">
      <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v16.5h16.5M8 16.5v-6M13 16.5v-10M18 16.5v-3" />
      </svg>
      <p className="text-sm">Aucune catégorie à afficher</p>
    </div>
  );
}

function CountLabel(props) {
  const { x, y, width, height, index, data } = props;
  const entry = data[index];
  if (!entry) return null;
  return (
    <text
      x={x + width + 8}
      y={y + height / 2}
      dy={4}
      fontSize={12}
      fontWeight={600}
      fill="#374151"
      className="dark:fill-gray-300"
    >
      {entry.count} · {entry.pct}%
    </text>
  );
}

function ChartSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-8 w-full animate-pulse rounded-lg bg-gray-100 dark:bg-slate-700/50" />
      ))}
    </div>
  );
}

function CategoryBarChart({ data, isLoading = false, onSelectCategory }) {
  const [activeIndex, setActiveIndex] = useState(null);

  const enriched = useMemo(() => {
    if (!data || data.length === 0) return [];
    const total = data.reduce((sum, d) => sum + (d.count || 0), 0);
    return [...data]
      .sort((a, b) => (b.count || 0) - (a.count || 0))
      .map((d, i) => ({
        ...d,
        pct: total > 0 ? Math.round(((d.count || 0) / total) * 1000) / 10 : 0,
        fill: d.couleur || FALLBACK_SCALE[i % FALLBACK_SCALE.length],
      }));
  }, [data]);

  if (isLoading) {
    return (
      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800 md:p-6">
        <div className="mb-4 h-6 w-52 animate-pulse rounded bg-gray-100 dark:bg-slate-700" />
        <ChartSkeleton />
      </div>
    );
  }

  const hasData = enriched.length > 0;
  const chartHeight = Math.max(220, enriched.length * 44);

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800 md:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
          Doléances par catégorie
        </h2>
        {hasData && (
          <span className="rounded-full bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-500 dark:bg-slate-700 dark:text-gray-400">
            {enriched.reduce((s, d) => s + d.count, 0)} au total
          </span>
        )}
      </div>

      {!hasData ? (
        <EmptyState />
      ) : (
        <div style={{ width: '100%', height: chartHeight }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={enriched}
              layout="vertical"
              margin={{ top: 4, right: 56, left: 8, bottom: 4 }}
              barCategoryGap="28%"
              onMouseLeave={() => setActiveIndex(null)}
            >
              <CartesianGrid strokeDasharray="3 6" stroke="#E5E7EB" horizontal={false} />
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="nom_categorie"
                stroke="#6B7280"
                fontSize={12.5}
                tickLine={false}
                axisLine={false}
                width={130}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#D4AF37', fillOpacity: 0.06 }} />
              <Bar
                dataKey="count"
                radius={[0, 8, 8, 0]}
                animationDuration={700}
                onMouseEnter={(_, i) => setActiveIndex(i)}
                onClick={(entry) => onSelectCategory && onSelectCategory(entry)}
                cursor={onSelectCategory ? 'pointer' : 'default'}
              >
                {enriched.map((entry, i) => (
                  <Cell
                    key={entry.nom_categorie}
                    fill={entry.fill}
                    fillOpacity={activeIndex === null || activeIndex === i ? 1 : 0.45}
                  />
                ))}
                <LabelList dataKey="count" content={(props) => <CountLabel {...props} data={enriched} />} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export default CategoryBarChart;
