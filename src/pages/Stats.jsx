import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts'
import { useMyCollection } from '../store/collection'
import { useSettings } from '../store/settings'
import { getConsole } from '../lib/consoles'
import { FORMATS, REGIONS, isComplete, formatPrice, displayNote } from '../lib/games'
import { Cover } from '../components/GameCard'
import { EmptyState } from '../components/States'

// Recharts a besoin de vraies couleurs : on lit les variables CSS du thème actif
function useThemeColors() {
  const theme = useSettings((s) => s.theme)
  return useMemo(() => {
    const css = getComputedStyle(document.documentElement)
    const get = (name) => css.getPropertyValue(name).trim()
    return {
      accent: get('--accent'),
      muted: get('--muted'),
      line: get('--line'),
      panel: get('--panel'),
      series: [get('--series-1'), get('--series-2'), get('--series-3')],
    }
  }, [theme])
}

function Tile({ label, value, detail, children }) {
  return (
    <div className="panel p-4">
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 font-pixel text-base leading-relaxed text-ink-strong sm:text-lg">{value}</p>
      {detail && <p className="text-xs text-muted">{detail}</p>}
      {children}
    </div>
  )
}

function ChartCard({ title, children, className = '' }) {
  return (
    <div className={`panel min-w-0 p-4 ${className}`}>
      <h2 className="mb-3 font-semibold text-ink-strong">{title}</h2>
      {children}
    </div>
  )
}

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const { name, value } = payload[0].payload
  return (
    <div className="rounded-md border border-line bg-panel px-3 py-2 text-sm shadow-lg">
      <p className="text-muted">{name}</p>
      <p className="font-semibold text-ink-strong">
        {value} {value > 1 ? 'jeux' : 'jeu'}
      </p>
    </div>
  )
}

export default function Stats() {
  const { consoles, jeux } = useMyCollection()
  const noteScale = useSettings((s) => s.noteScale)
  const colors = useThemeColors()
  const navigate = useNavigate()

  const stats = useMemo(() => {
    const owned = jeux.filter((j) => j.statut === 'possede')
    const count = (list, key) => list.reduce((acc, j) => ({ ...acc, [key(j)]: (acc[key(j)] ?? 0) + 1 }), {})

    const perConsole = count(owned, (j) => j.consoleId)
    const perFormat = count(owned, (j) => j.format)
    const perRegion = count(owned, (j) => j.region)
    const prices = owned.filter((j) => j.prix !== null && j.prix !== undefined)
    const spent = prices.reduce((sum, j) => sum + j.prix, 0)

    return {
      owned,
      wishlist: jeux.length - owned.length,
      complete: owned.filter(isComplete).length,
      spent,
      average: prices.length ? spent / prices.length : null,
      byConsole: Object.entries(perConsole)
        .map(([id, value]) => ({ name: getConsole(id)?.nom ?? id, value }))
        .sort((a, b) => b.value - a.value),
      byFormat: Object.keys(FORMATS)
        .map((key) => ({ key, name: FORMATS[key].label, value: perFormat[key] ?? 0 }))
        .filter((d) => d.value > 0),
      byRegion: REGIONS.map((r) => ({ name: r, value: perRegion[r] ?? 0 })),
      top: owned
        .filter((j) => j.note)
        .sort((a, b) => b.note - a.note || a.titre.localeCompare(b.titre))
        .slice(0, 5),
    }
  }, [jeux])

  if (stats.owned.length === 0) {
    return (
      <section>
        <h1 className="mb-5 font-pixel text-sm leading-relaxed text-ink-strong sm:text-base">Statistiques</h1>
        <EmptyState title="Pas encore de stats" icon="📊">
          Ajoute quelques jeux à ta collection pour voir apparaître les graphiques.{' '}
          <Link to="/" className="text-accent underline">
            Mes consoles
          </Link>
        </EmptyState>
      </section>
    )
  }

  const percentComplete = Math.round((stats.complete / stats.owned.length) * 100)
  const formatColor = (key) => colors.series[Object.keys(FORMATS).indexOf(key)]
  const axis = { stroke: colors.muted, fontSize: 12, tickLine: false, axisLine: false }

  function openGame(game) {
    const entry = consoles.find((c) => c.consoleId === game.consoleId)
    if (entry) navigate(`/console/${entry.id}?jeu=${game.id}`)
  }

  return (
    <section className="space-y-4">
      <h1 className="font-pixel text-sm leading-relaxed text-ink-strong sm:text-base">Statistiques</h1>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Tile label="Jeux possédés" value={stats.owned.length} detail={`sur ${consoles.length} console${consoles.length > 1 ? 's' : ''}`} />
        <Tile label="Complets" value={`${percentComplete} %`} detail={`${stats.complete} sur ${stats.owned.length}`}>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-panel-2" role="img" aria-label={`${percentComplete} % de jeux complets`}>
            <div className="h-full rounded-full bg-[#2e7d32]" style={{ width: `${percentComplete}%` }} />
          </div>
        </Tile>
        <Tile
          label="Total dépensé"
          value={formatPrice(stats.spent)}
          detail={stats.average !== null ? `${formatPrice(stats.average)} en moyenne` : 'aucun prix saisi'}
        />
        <Tile label="Wishlist" value={stats.wishlist} detail="jeux recherchés" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Jeux par console">
          <div style={{ height: Math.max(140, stats.byConsole.length * 38) }}>
            <ResponsiveContainer>
              <BarChart data={stats.byConsole} layout="vertical" margin={{ left: 0, right: 16 }}>
                <CartesianGrid horizontal={false} stroke={colors.line} />
                <XAxis type="number" allowDecimals={false} {...axis} />
                <YAxis type="category" dataKey="name" width={110} {...axis} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: colors.line }} />
                <Bar dataKey="value" fill={colors.accent} radius={[0, 4, 4, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Format des jeux">
          <div className="flex items-center gap-4">
            <div className="h-44 w-44 shrink-0">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={stats.byFormat}
                    dataKey="value"
                    nameKey="name"
                    innerRadius="58%"
                    outerRadius="100%"
                    stroke={colors.panel}
                    strokeWidth={stats.byFormat.length > 1 ? 2 : 0}
                    isAnimationActive={false}
                  >
                    {stats.byFormat.map((d) => (
                      <Cell key={d.key} fill={formatColor(d.key)} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* légende avec les valeurs : la couleur n'est jamais la seule info */}
            <ul className="space-y-2 text-sm">
              {stats.byFormat.map((d) => (
                <li key={d.key} className="flex items-center gap-2">
                  <span className="h-3 w-3 shrink-0 rounded-sm" style={{ background: formatColor(d.key) }} />
                  <span>
                    {d.name}
                    <span className="block text-xs text-muted">
                      {d.value} · {Math.round((d.value / stats.owned.length) * 100)} %
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </ChartCard>

        <ChartCard title="Répartition par région">
          <div className="h-44">
            <ResponsiveContainer>
              <BarChart data={stats.byRegion} margin={{ left: -20, right: 8 }}>
                <CartesianGrid vertical={false} stroke={colors.line} />
                <XAxis dataKey="name" {...axis} />
                <YAxis allowDecimals={false} {...axis} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: colors.line }} />
                <Bar dataKey="value" fill={colors.accent} radius={[4, 4, 0, 0]} barSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Mes jeux les mieux notés">
          {stats.top.length === 0 ? (
            <p className="text-sm text-muted">Note tes jeux depuis leur fiche pour voir ton top ici.</p>
          ) : (
            <ol className="space-y-2">
              {stats.top.map((game, i) => (
                <li key={game.id}>
                  <button className="flex w-full items-center gap-3 rounded-lg p-1.5 text-left hover:bg-panel-2/60" onClick={() => openGame(game)}>
                    <span className="w-5 shrink-0 text-center font-pixel text-[0.6rem] text-accent">{i + 1}</span>
                    <Cover src={game.image} title={game.titre} className="h-12 w-10 shrink-0 rounded" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold text-ink-strong">{game.titre}</span>
                      <span className="text-xs text-muted">{getConsole(game.consoleId)?.nom}</span>
                    </span>
                    <span className="shrink-0 font-bold text-[#ffc83d]">★ {displayNote(game.note, noteScale)}</span>
                  </button>
                </li>
              ))}
            </ol>
          )}
        </ChartCard>
      </div>
    </section>
  )
}
