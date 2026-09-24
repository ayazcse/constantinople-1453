import { useMemo, useState } from 'react'
import { MapContainer, TileLayer, Polyline, CircleMarker, Popup } from 'react-leaflet'
import { Waves, Info } from 'lucide-react'
import { useDataMany } from '../lib/useData'
import { LoadingBlock, ErrorBlock } from '../components/StateBlocks'
import Panel from '../components/Panel'
import SectionHeading from '../components/SectionHeading'
import SourceCite from '../components/SourceCite'
import { buildSourceMap } from '../lib/format'

const LAYER_DEFS = [
  { key: 'City', label: 'City landmarks', color: '#E8C579' },
  { key: 'Walls', label: 'Walls & gates', color: '#ECE3CE' },
  { key: 'Water', label: 'Water bodies', color: '#57937F' },
  { key: 'Strategic', label: 'Strategic sites', color: '#8E5FB0' },
]

const LINE_STYLES = {
  land_wall: { color: '#C6A24E', weight: 4, dashArray: null },
  blachernae_wall: { color: '#8E5FB0', weight: 3, dashArray: '6 4' },
  sea_wall: { color: '#57937F', weight: 2.5, dashArray: '2 5' },
  boom: { color: '#C85252', weight: 3, dashArray: '1 6' },
  overland: { color: '#C85252', weight: 2.5, dashArray: '8 5' },
  artillery_focus: { color: '#E8C579', weight: 5, dashArray: '1 3' },
}

const SIDE_COLOR = {
  Byzantine: '#8E5FB0',
  Ottoman: '#C85252',
  Genoese: '#57937F',
  Neutral: '#E8C579',
}

export default function Geography() {
  const { data, loading, error } = useDataMany(['locations', 'map_geometries', 'sources'])
  const [activeLayers, setActiveLayers] = useState(new Set(['City', 'Walls', 'Water', 'Strategic']))
  const [selected, setSelected] = useState(null)
  const sourceMap = useMemo(() => buildSourceMap(data.sources), [data.sources])

  if (loading) return <LoadingBlock label="Rendering the strategic map…" />
  if (error) return <ErrorBlock message={error} />

  const { locations, map_geometries: geometries } = data
  const visibleLocations = locations.filter((l) => activeLayers.has(l.layer) && l.lat && l.lon)
  const visibleLines = geometries.filter((g) => activeLayers.has(g.layer))

  function toggleLayer(key) {
    setActiveLayers((prev) => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Page 03 — Geography & Strategy"
        title="Why the map decided as much as the army did"
        blurb="Wall vertices marked 'Published GPS' come from a cited source; everything else is an approximate, labelled placement — this map is an analytical aid, not a surveyed reconstruction."
      />

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          <div className="flex flex-wrap gap-2">
            {LAYER_DEFS.map((l) => (
              <button
                key={l.key}
                onClick={() => toggleLayer(l.key)}
                className={`inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border transition ${
                  activeLayers.has(l.key)
                    ? 'border-gold/40 bg-ink-panel text-parchment'
                    : 'border-ink-line text-parchment-faint'
                }`}
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: activeLayers.has(l.key) ? l.color : '#4A4F63' }}
                />
                {l.label}
              </button>
            ))}
          </div>

          <Panel className="p-2 overflow-hidden">
            <div className="h-[560px] rounded-lg overflow-hidden">
              <MapContainer center={[41.015, 28.955]} zoom={13} scrollWheelZoom style={{ height: '100%', width: '100%' }}>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />
                {visibleLines.map((g) => (
                  <Polyline
                    key={g.feature_id}
                    positions={g.coordinates}
                    pathOptions={LINE_STYLES[g.style_key] || { color: '#C6A24E', weight: 2 }}
                  >
                    <Popup>
                      <div className="text-xs">
                        <div className="font-semibold text-parchment mb-1">{g.name}</div>
                        <p className="text-parchment-dim">{g.description}</p>
                        <p className="text-[10px] text-gold/80 mt-1 uppercase tracking-wide">{g.coord_quality}</p>
                      </div>
                    </Popup>
                  </Polyline>
                ))}
                {visibleLocations.map((loc) => (
                  <CircleMarker
                    key={loc.location_id}
                    center={[loc.lat, loc.lon]}
                    radius={loc.type === 'Water body' ? 3 : 6}
                    pathOptions={{
                      color: SIDE_COLOR[loc.side] || '#E8C579',
                      fillColor: SIDE_COLOR[loc.side] || '#E8C579',
                      fillOpacity: 0.75,
                      weight: 1.5,
                    }}
                    eventHandlers={{ click: () => setSelected(loc) }}
                  >
                    <Popup>
                      <div className="text-xs">
                        <div className="font-semibold text-parchment mb-1">{loc.name}</div>
                        <p className="text-parchment-dim">{loc.description}</p>
                        <p className="text-[10px] text-gold/80 mt-1 uppercase tracking-wide">
                          {loc.coord_quality} · {loc.side}
                        </p>
                      </div>
                    </Popup>
                  </CircleMarker>
                ))}
              </MapContainer>
            </div>
          </Panel>

          <div className="flex flex-wrap gap-4 text-[11px] text-parchment-faint px-1">
            {Object.entries(SIDE_COLOR).map(([side, color]) => (
              <div key={side} className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ background: color }} />
                {side}
              </div>
            ))}
          </div>
        </div>

        {/* Side panel */}
        <div className="space-y-5">
          <Panel className="p-5">
            <div className="flex items-center gap-2 text-gold mb-3">
              <Waves size={17} />
              <h3 className="font-display text-lg text-parchment">Why geography mattered</h3>
            </div>
            <div className="space-y-3 text-sm text-parchment-dim leading-relaxed">
              <p>
                <span className="text-parchment font-medium">The peninsula's shape did the defending.</span> Water
                covered two sides (the Golden Horn and the Sea of Marmara), leaving only the western land approach
                where the full Theodosian triple-wall system was needed — everywhere else, a single sea wall sufficed
                against the naval technology of the era.
              </p>
              <p>
                <span className="text-parchment font-medium">The Golden Horn chain converted a weakness into a
                choke point.</span> A boom across the harbor mouth meant the comparatively weaker Golden Horn sea walls
                only had to hold if the chain held — until the 22 April overland transfer removed that assumption.
              </p>
              <p>
                <span className="text-parchment font-medium">The Bosphorus fortresses (Rumelihisari, 1452) closed the
                back door.</span> Built at the strait's narrowest point months before the siege, they cut the city off
                from Black Sea grain and reinforcement before a single gun fired at the walls.
              </p>
              <p>
                <span className="text-parchment font-medium">The Lycus valley was a dip, not just a sector.</span> Where
                the walls cross the stream valley, the terrain itself lowered the effective wall height — which is why
                the heaviest bombardment and the decisive 29 May breach both concentrated there (see Defensive Systems).
              </p>
            </div>
            <div className="mt-4 rounded-lg border border-byz/30 bg-byz/10 px-3 py-2 text-[11px] text-parchment-dim flex gap-2">
              <Info size={13} className="text-byz-bright shrink-0 mt-0.5" />
              This panel is analytical synthesis drawing on the sourced facts elsewhere in this project, not a single
              cited passage — treat it as interpretation.
            </div>
          </Panel>

          {selected && (
            <Panel className="p-5">
              <h4 className="font-display text-lg text-parchment mb-1">{selected.name}</h4>
              <p className="text-xs text-parchment-faint uppercase tracking-wide mb-3">
                {selected.layer} · {selected.type} · {selected.coord_quality}
              </p>
              <p className="text-sm text-parchment-dim leading-relaxed">{selected.description}</p>
              <div className="mt-3">
                <SourceCite ids={selected.source_id_list} sourceMap={sourceMap} />
              </div>
            </Panel>
          )}
        </div>
      </div>
    </div>
  )
}
