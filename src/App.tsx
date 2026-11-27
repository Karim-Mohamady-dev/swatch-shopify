import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowCounterClockwise,
  ArrowDown,
  ArrowsLeftRight,
  Check,
  Minus,
  Plus,
  ShoppingBag,
  Star,
  Trash,
  X,
} from '@phosphor-icons/react'
import { detectLang, useDict, type Lang } from './i18n.ts'

/* ---------- data ---------- */

type Colour = {
  id: string
  hex: string
  shade: string
  light: string
  dark: boolean // true = dark flood, needs white text
  nameKey: string
}

const COLOURS: Colour[] = [
  { id: 'tangerine', hex: '#f97316', shade: '#c2410c', light: '#fdba74', dark: false, nameKey: 'colours.tangerine' },
  { id: 'berry', hex: '#be185d', shade: '#881337', light: '#f9a8d4', dark: true, nameKey: 'colours.berry' },
  { id: 'cobalt', hex: '#1d4ed8', shade: '#1e3a8a', light: '#93c5fd', dark: true, nameKey: 'colours.cobalt' },
  { id: 'plum', hex: '#7e22ce', shade: '#581c87', light: '#d8b4fe', dark: true, nameKey: 'colours.plum' },
  { id: 'butter', hex: '#facc15', shade: '#a16207', light: '#fef08a', dark: false, nameKey: 'colours.butter' },
]

const SWATCH_IDS = ['tangerine', 'berry', 'cobalt', 'plum', 'butter']

type Product = { id: string; colourId: string; price: number; was?: number; nameKey: string; descKey: string }

const PRODUCTS: Product[] = [
  { id: 'tangerine', colourId: 'tangerine', price: 89, was: 110, nameKey: 'products.tangerine.name', descKey: 'products.tangerine.desc' },
  { id: 'berry', colourId: 'berry', price: 89, was: 110, nameKey: 'products.berry.name', descKey: 'products.berry.desc' },
  { id: 'cobalt', colourId: 'cobalt', price: 94, nameKey: 'products.cobalt.name', descKey: 'products.cobalt.desc' },
  { id: 'plum', colourId: 'plum', price: 89, was: 110, nameKey: 'products.plum.name', descKey: 'products.plum.desc' },
  { id: 'butter', colourId: 'butter', price: 89, was: 110, nameKey: 'products.butter.name', descKey: 'products.butter.desc' },
]

const SIZES = ['XS', 'S', 'M', 'L', 'XL']

type BagItem = { productId: string; size: string; qty: number }

const BAG_KEY = 'swatch-shopify-bag'
const SEL_KEY = 'swatch-shopify-selection'

function loadBag(): BagItem[] {
  try {
    const raw = localStorage.getItem(BAG_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as BagItem[]
    return Array.isArray(parsed) ? parsed.filter((i) => i && typeof i.qty === 'number') : []
  } catch {
    return []
  }
}

function loadSelection(): { productId: string; size: string } {
  try {
    const raw = localStorage.getItem(SEL_KEY)
    if (raw) {
      const p = JSON.parse(raw) as { productId?: string; size?: string }
      if (p && PRODUCTS.some((pr) => pr.id === p.productId)) {
        return { productId: p.productId as string, size: typeof p.size === 'string' ? p.size : '' }
      }
    }
  } catch {
    // fall through
  }
  return { productId: 'tangerine', size: '' }
}

const money = (n: number) => `$${n.toFixed(2)}`

/* ---------- SVG puffer jacket (original, CSS/SVG only) ---------- */

function Jacket({ colour, label, back = false }: { colour: Colour; label: string; back?: boolean }) {
  return (
    <svg viewBox="0 0 400 420" role="img" aria-label={label} className="h-auto w-full drop-shadow-2xl">
      {/* left sleeve */}
      <path d="M118 108 Q58 150 52 252 L56 306 Q58 322 74 320 L96 316 Q104 300 102 262 Q98 178 132 128 Z" fill={colour.hex} stroke={colour.shade} strokeWidth="4" strokeLinejoin="round" />
      <path d="M66 210 Q84 216 100 212 M62 258 Q80 264 98 260" stroke={colour.shade} strokeWidth="3" fill="none" opacity="0.55" />
      <rect x="54" y="296" width="46" height="26" rx="10" fill={colour.shade} />
      {/* right sleeve */}
      <path d="M282 108 Q342 150 348 252 L344 306 Q342 322 326 320 L304 316 Q296 300 298 262 Q302 178 268 128 Z" fill={colour.hex} stroke={colour.shade} strokeWidth="4" strokeLinejoin="round" />
      <path d="M334 210 Q316 216 300 212 M338 258 Q320 264 302 260" stroke={colour.shade} strokeWidth="3" fill="none" opacity="0.55" />
      <rect x="300" y="296" width="46" height="26" rx="10" fill={colour.shade} />
      {/* collar / hood */}
      <ellipse cx="200" cy="72" rx="58" ry="34" fill={colour.shade} />
      <ellipse cx="200" cy="66" rx="44" ry="24" fill={colour.hex} />
      {/* body */}
      <path d="M112 92 Q200 62 288 92 L304 296 Q306 332 272 334 L128 334 Q94 332 96 296 Z" fill={colour.hex} stroke={colour.shade} strokeWidth="4" strokeLinejoin="round" />
      {/* quilt lines */}
      <path d="M104 148 Q200 132 296 148" stroke={colour.shade} strokeWidth="3" fill="none" opacity="0.55" />
      <path d="M100 196 Q200 180 300 196" stroke={colour.shade} strokeWidth="3" fill="none" opacity="0.55" />
      <path d="M99 244 Q200 228 301 244" stroke={colour.shade} strokeWidth="3" fill="none" opacity="0.55" />
      <path d="M100 292 Q200 276 300 292" stroke={colour.shade} strokeWidth="3" fill="none" opacity="0.55" />
      {back ? (
        <>
          {/* back yoke seam */}
          <path d="M112 122 Q200 106 288 122" stroke={colour.shade} strokeWidth="3" fill="none" opacity="0.55" />
          {/* back label patch */}
          <rect x="180" y="96" width="40" height="24" rx="5" fill={colour.light} stroke={colour.shade} strokeWidth="2" />
          <line x1="190" y1="108" x2="210" y2="108" stroke={colour.shade} strokeWidth="2" />
        </>
      ) : (
        <>
          {/* zipper */}
          <line x1="200" y1="96" x2="200" y2="330" stroke={colour.shade} strokeWidth="6" />
          <rect x="192" y="112" width="16" height="26" rx="6" fill={colour.light} stroke={colour.shade} strokeWidth="2" />
          {/* pockets */}
          <rect x="122" y="262" width="52" height="40" rx="10" fill={colour.shade} opacity="0.55" />
          <rect x="226" y="262" width="52" height="40" rx="10" fill={colour.shade} opacity="0.55" />
        </>
      )}
      {/* sheen */}
      <ellipse cx="150" cy="130" rx="34" ry="52" fill={colour.light} opacity="0.35" transform="rotate(-12 150 130)" />
    </svg>
  )
}

/* ---------- app ---------- */

export default function App() {
  const [lang, setLang] = useState<Lang>(() => detectLang())
  const { t } = useDict(lang)
  const [sel, setSel] = useState(loadSelection)
  const [qty, setQty] = useState(1)
  const [bag, setBag] = useState<BagItem[]>(loadBag)
  const [bagOpen, setBagOpen] = useState(false)
  const [sizeError, setSizeError] = useState(false)
  const [added, setAdded] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [nameError, setNameError] = useState(false)
  const [emailError, setEmailError] = useState(false)
  const [orderNo, setOrderNo] = useState('')
  const [newsEmail, setNewsEmail] = useState('')
  const [newsError, setNewsError] = useState(false)
  const [newsDone, setNewsDone] = useState(false)
  const [back, setBack] = useState(false)
  const [splitLeft, setSplitLeft] = useState('tangerine')
  const [splitRight, setSplitRight] = useState('berry')
  const [split, setSplit] = useState(50)
  const [splitDragging, setSplitDragging] = useState(false)
  const splitRef = useRef<HTMLDivElement | null>(null)

  const product = PRODUCTS.find((p) => p.id === sel.productId) ?? PRODUCTS[0]
  const colour = COLOURS.find((c) => c.id === product.colourId) ?? COLOURS[0]
  const leftColour = COLOURS.find((c) => c.id === splitLeft) ?? COLOURS[0]
  const rightColour = COLOURS.find((c) => c.id === splitRight) ?? COLOURS[1]

  const isRtl = lang === 'ar'
  const ink = colour.dark ? '#ffffff' : '#1c1917'
  const muted = colour.dark ? 'rgba(255,255,255,0.75)' : 'rgba(28,25,23,0.65)'
  const cardBg = colour.dark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.55)'
  const cardBorder = colour.dark ? 'rgba(255,255,255,0.35)' : 'rgba(28,25,23,0.18)'
  const chipBg = colour.dark ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.65)'
  const btnBg = colour.dark ? '#ffffff' : '#1c1917'
  const btnFg = colour.dark ? '#1c1917' : '#ffffff'

  const bagCount = useMemo(() => bag.reduce((n, i) => n + i.qty, 0), [bag])
  const subtotal = useMemo(
    () =>
      bag.reduce((n, i) => {
        const p = PRODUCTS.find((pr) => pr.id === i.productId)
        return n + (p ? p.price * i.qty : 0)
      }, 0),
    [bag],
  )

  useEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr'
    try {
      localStorage.setItem('swatch-shopify-lang', lang)
    } catch {
      // storage unavailable
    }
  }, [lang, isRtl])

  useEffect(() => {
    try {
      localStorage.setItem(BAG_KEY, JSON.stringify(bag))
    } catch {
      // storage unavailable
    }
  }, [bag])

  useEffect(() => {
    try {
      localStorage.setItem(SEL_KEY, JSON.stringify(sel))
    } catch {
      // storage unavailable
    }
  }, [sel])

  useEffect(() => {
    if (!added) return
    const id = window.setTimeout(() => setAdded(false), 2200)
    return () => window.clearTimeout(id)
  }, [added])

  function pickColour(id: string) {
    const c = COLOURS.find((x) => x.id === id)
    if (!c) return
    const match = PRODUCTS.find((p) => p.colourId === id)
    setSel((s) => ({ ...s, productId: match ? match.id : s.productId }))
    setBack(false)
  }

  function pickProduct(id: string) {
    setSel((s) => ({ ...s, productId: id }))
    setQty(1)
    setBack(false)
    document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' })
  }

  function addToBag() {
    if (!sel.size) {
      setSizeError(true)
      return
    }
    setSizeError(false)
    setBag((prev) => {
      const idx = prev.findIndex((i) => i.productId === product.id && i.size === sel.size)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = { ...next[idx], qty: next[idx].qty + qty }
        return next
      }
      return [...prev, { productId: product.id, size: sel.size, qty }]
    })
    setAdded(true)
  }

  function setItemQty(productId: string, size: string, nextQty: number) {
    setBag((prev) =>
      nextQty <= 0
        ? prev.filter((i) => !(i.productId === productId && i.size === size))
        : prev.map((i) => (i.productId === productId && i.size === size ? { ...i, qty: nextQty } : i)),
    )
  }

  function placeOrder() {
    const badName = name.trim().length < 2
    const badEmail = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    setNameError(badName)
    setEmailError(badEmail)
    if (badName || badEmail) return
    setOrderNo(`SW-${Math.floor(100000 + Math.random() * 900000)}`)
    setBag([])
    setName('')
    setEmail('')
  }

  function subscribe() {
    const bad = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newsEmail.trim())
    setNewsError(bad)
    if (bad) return
    setNewsDone(true)
    setNewsEmail('')
  }

  function splitFromClientX(clientX: number) {
    const el = splitRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    setSplit(Math.min(94, Math.max(6, ((clientX - rect.left) / rect.width) * 100)))
  }

  const coldItems = [
    { num: '01', title: t('cold.i1title'), text: '' },
    { num: '02', title: t('cold.i2title'), text: t('cold.i2text') },
    { num: '03', title: t('cold.i3title'), text: t('cold.i3text') },
    { num: '04', title: t('cold.i4title'), text: t('cold.i4text') },
  ]
  const reviews = [
    { name: t('reviews.r1name'), text: t('reviews.r1text') },
    { name: t('reviews.r2name'), text: t('reviews.r2text') },
    { name: t('reviews.r3name'), text: t('reviews.r3text') },
  ]

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className="min-h-screen"
      style={{ backgroundColor: colour.hex, color: ink, transition: 'background-color 700ms ease, color 700ms ease' }}
    >
      {/* header */}
      <header className="sticky top-0 z-40 backdrop-blur-md" style={{ backgroundColor: colour.dark ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.35)', borderBottom: `1px solid ${cardBorder}` }}>
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <a href="#shop" className="flex items-baseline gap-2">
            <span className="text-2xl font-black tracking-tight">{t('app.name')}</span>
            <span className="hidden text-xs font-medium uppercase tracking-widest sm:inline" style={{ color: muted }}>{t('app.tagline')}</span>
          </a>
          <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
            <a href="#shop" className="hover:opacity-70">{t('nav.shop')}</a>
            <a href="#colours" className="hover:opacity-70">{t('nav.colours')}</a>
            <a href="#range" className="hover:opacity-70">{t('nav.range')}</a>
            <a href="#about" className="hover:opacity-70">{t('nav.about')}</a>
          </nav>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
              className="rounded-full px-3 py-2 text-sm font-bold"
              style={{ backgroundColor: chipBg, color: ink }}
            >
              {lang === 'en' ? 'العربية' : 'English'}
            </button>
            <button
              type="button"
              onClick={() => setBagOpen(true)}
              className="relative flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold"
              style={{ backgroundColor: btnBg, color: btnFg }}
              aria-label={t('nav.bag')}
            >
              <ShoppingBag size={18} weight="bold" />
              <span className="hidden sm:inline">{t('nav.bag')}</span>
              {bagCount > 0 && (
                <span className="absolute -top-1.5 -end-1.5 flex h-6 w-6 items-center justify-center rounded-full text-xs font-black" style={{ backgroundColor: colour.shade, color: '#fff' }}>
                  {bagCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* hero / product */}
      <main id="shop" className="mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div className="order-2 lg:order-1">
            <p className="inline-block rounded-full px-3 py-1 text-xs font-bold uppercase tracking-widest" style={{ backgroundColor: chipBg }}>
              {t('hero.badge')}
            </p>
            <h1 className="mt-4 text-4xl font-black leading-tight sm:text-5xl">{t(product.nameKey)}</h1>
            <p className="mt-2 text-3xl font-black">
              {money(product.price)}
              {product.was !== undefined && (
                <span className="ms-3 text-xl font-bold line-through" style={{ color: muted }}>{money(product.was)}</span>
              )}
            </p>
            <p className="mt-4 max-w-lg leading-relaxed" style={{ color: muted }}>{t('hero.desc')}</p>
            <p className="mt-2 text-sm" style={{ color: muted }}>{t(product.descKey)}</p>

            {/* colours */}
            <div id="colours" className="mt-8">
              <p className="text-sm font-bold uppercase tracking-widest">{t('colours.title')}: {t(colour.nameKey)}</p>
              <div className="mt-3 flex flex-wrap gap-3">
                {SWATCH_IDS.map((id) => {
                  const c = COLOURS.find((x) => x.id === id)!
                  const active = colour.id === id
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => pickColour(id)}
                      aria-label={t(c.nameKey)}
                      title={t(c.nameKey)}
                      className="flex h-12 w-12 items-center justify-center rounded-full border-2 transition-transform hover:scale-110"
                      style={{
                        backgroundColor: c.hex,
                        borderColor: active ? ink : 'rgba(128,128,128,0.4)',
                        boxShadow: active ? `0 0 0 3px ${colour.hex}, 0 0 0 5px ${ink}` : undefined,
                      }}
                    >
                      {active && <Check size={20} weight="bold" color={c.dark ? '#fff' : '#1c1917'} />}
                    </button>
                  )
                })}
              </div>
              <p className="mt-3 text-sm" style={{ color: muted }}>
                {SWATCH_IDS.map((id) => t(COLOURS.find((x) => x.id === id)!.nameKey)).join(' · ')}
              </p>
              <p className="mt-1 text-sm font-bold">{t('hero.floodNote')}</p>
            </div>

            {/* sizes */}
            <div className="mt-8">
              <p className="text-sm font-bold uppercase tracking-widest">{t('hero.sizeLabel')}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {SIZES.map((s) => {
                  const active = sel.size === s
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        setSel((prev) => ({ ...prev, size: s }))
                        setSizeError(false)
                      }}
                      className="h-11 min-w-11 rounded-xl px-3 text-sm font-bold"
                      style={{
                        backgroundColor: active ? btnBg : chipBg,
                        color: active ? btnFg : ink,
                        border: `1px solid ${active ? btnBg : cardBorder}`,
                      }}
                    >
                      {t(`sizes.${s.toLowerCase()}`)}
                    </button>
                  )
                })}
              </div>
              {sizeError && <p className="mt-2 text-sm font-bold" role="alert">{t('hero.sizeRequired')}</p>}
            </div>

            {/* qty + add */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <div className="flex items-center rounded-xl" style={{ border: `1px solid ${cardBorder}`, backgroundColor: chipBg }}>
                <span className="ps-3 text-xs font-bold uppercase tracking-wider" style={{ color: muted }}>{t('hero.qtyLabel')}</span>
                <button type="button" aria-label="decrease" onClick={() => setQty((q) => Math.max(1, q - 1))} className="p-3 hover:opacity-70">
                  <Minus size={16} weight="bold" />
                </button>
                <span className="w-8 text-center text-lg font-black">{qty}</span>
                <button type="button" aria-label="increase" onClick={() => setQty((q) => Math.min(9, q + 1))} className="p-3 hover:opacity-70">
                  <Plus size={16} weight="bold" />
                </button>
              </div>
              <button
                type="button"
                onClick={addToBag}
                className="flex items-center gap-2 rounded-xl px-6 py-3.5 text-base font-black shadow-lg transition-transform hover:scale-[1.02]"
                style={{ backgroundColor: btnBg, color: btnFg }}
              >
                <ShoppingBag size={20} weight="bold" />
                {t('hero.addToBag')} — {money(product.price * qty)}
              </button>
            </div>
            {added && (
              <p className="mt-3 flex items-center gap-2 text-sm font-bold" role="status">
                <Check size={18} weight="bold" /> {t('hero.added')}
              </p>
            )}
            <p className="mt-4 text-sm" style={{ color: muted }}>{t('hero.freeShipping')}</p>
          </div>

          {/* jacket visual */}
          <div className="order-1 lg:order-2">
            <div className="relative mx-auto max-w-md overflow-hidden rounded-[2.5rem] p-6 sm:p-8" style={{ backgroundColor: cardBg, border: `1px solid ${cardBorder}` }}>
              {/* giant colour name behind the product */}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden" aria-hidden="true">
                <span className="whitespace-nowrap text-[5rem] font-black uppercase leading-none tracking-tight opacity-10 sm:text-[6.5rem]">
                  {t(colour.nameKey)}
                </span>
              </div>
              <div className="relative">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest">
                  <span>{t(colour.nameKey)}</span>
                  <span>
                    {money(product.price)}
                    {product.was !== undefined && (
                      <span className="ms-2 line-through" style={{ color: muted }}>{money(product.was)}</span>
                    )}
                  </span>
                </div>
                <div key={`${colour.id}-${back ? 'back' : 'front'}`} className="flood-jacket mt-2">
                  <Jacket colour={colour} label={t(product.nameKey)} back={back} />
                </div>
                <p className="text-center text-sm font-bold">
                  {t(product.nameKey)} — {back ? t('turn.back') : t('turn.front')}
                </p>
                <p className="mt-1 text-center text-xs" style={{ color: muted }}>{t('hero.total')}: {money(product.price * qty)}</p>
              </div>
            </div>
            {/* turn it around */}
            <div className="mx-auto mt-4 max-w-md text-center">
              <button
                type="button"
                onClick={() => setBack((b) => !b)}
                className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-black shadow transition-transform hover:scale-[1.03]"
                style={{ backgroundColor: btnBg, color: btnFg }}
              >
                <ArrowCounterClockwise size={18} weight="bold" />
                {t('turn.title')} — {back ? t('turn.front') : t('turn.back')}
              </button>
              <p className="mt-2 text-xs" style={{ color: muted }}>{t('turn.hint')}</p>
            </div>
          </div>
        </div>

        {/* colour split */}
        <section id="split" className="mt-20">
          <h2 className="text-3xl font-black">{t('split.title')}</h2>
          <p className="mt-2 max-w-2xl" style={{ color: muted }}>{t('split.subtitle')}</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {([
              { label: t('split.left'), value: splitLeft, set: setSplitLeft },
              { label: t('split.right'), value: splitRight, set: setSplitRight },
            ] as const).map((side) => (
              <div key={side.label} className="rounded-3xl p-5" style={{ backgroundColor: cardBg, border: `1px solid ${cardBorder}` }}>
                <p className="text-sm font-bold uppercase tracking-widest">
                  {side.label}: {t(COLOURS.find((x) => x.id === side.value)!.nameKey)}
                </p>
                <div className="mt-3 flex flex-wrap gap-3">
                  {SWATCH_IDS.map((id) => {
                    const c = COLOURS.find((x) => x.id === id)!
                    const active = side.value === id
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => side.set(id)}
                        aria-label={`${side.label}: ${t(c.nameKey)}`}
                        title={t(c.nameKey)}
                        className="flex h-11 w-11 items-center justify-center rounded-full border-2 transition-transform hover:scale-110"
                        style={{
                          backgroundColor: c.hex,
                          borderColor: active ? ink : 'rgba(128,128,128,0.4)',
                          boxShadow: active ? `0 0 0 3px ${colour.hex}, 0 0 0 5px ${ink}` : undefined,
                        }}
                      >
                        {active && <Check size={18} weight="bold" color={c.dark ? '#fff' : '#1c1917'} />}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          <div
            ref={splitRef}
            className="relative mt-6 h-[440px] touch-none select-none overflow-hidden rounded-[2rem]"
            style={{ backgroundColor: cardBg, border: `1px solid ${cardBorder}` }}
            onPointerDown={(e) => {
              setSplitDragging(true)
              splitFromClientX(e.clientX)
              e.currentTarget.setPointerCapture(e.pointerId)
            }}
            onPointerMove={(e) => {
              if (splitDragging) splitFromClientX(e.clientX)
            }}
            onPointerUp={() => setSplitDragging(false)}
            onPointerCancel={() => setSplitDragging(false)}
          >
            {/* right layer (full) */}
            <div className="absolute inset-0 flex items-center justify-center p-8">
              <div className="w-full max-w-[300px]">
                <Jacket colour={rightColour} label={t(rightColour.nameKey)} />
              </div>
            </div>
            {/* left layer (clipped to the split) */}
            <div
              className="absolute inset-0 flex items-center justify-center p-8"
              style={{ clipPath: `inset(0 ${100 - split}% 0 0)` }}
            >
              <div className="w-full max-w-[300px]">
                <Jacket colour={leftColour} label={t(leftColour.nameKey)} />
              </div>
            </div>
            {/* side labels */}
            <span className="absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-black" style={{ backgroundColor: chipBg, color: ink }}>
              {t('split.left')} · {t(leftColour.nameKey)}
            </span>
            <span className="absolute right-4 top-4 rounded-full px-3 py-1 text-xs font-black" style={{ backgroundColor: chipBg, color: ink }}>
              {t('split.right')} · {t(rightColour.nameKey)}
            </span>
            {/* divider */}
            <div className="absolute bottom-0 top-0" style={{ left: `${split}%` }}>
              <div className="absolute bottom-0 top-0 -left-px w-0.5" style={{ backgroundColor: ink }} />
              <button
                type="button"
                role="slider"
                aria-label={t('split.title')}
                aria-valuenow={Math.round(split)}
                aria-valuemin={6}
                aria-valuemax={94}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowLeft') setSplit((s) => Math.max(6, s - 5))
                  if (e.key === 'ArrowRight') setSplit((s) => Math.min(94, s + 5))
                }}
                className="absolute top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize items-center justify-center rounded-full shadow-lg"
                style={{ backgroundColor: btnBg, color: btnFg }}
              >
                <ArrowsLeftRight size={20} weight="bold" />
              </button>
            </div>
          </div>
        </section>

        {/* built for the cold */}
        <section id="about" className="mt-20">
          <h2 className="text-3xl font-black">{t('cold.title')}</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {coldItems.map((item) => (
              <div key={item.num} className="rounded-3xl p-6" style={{ backgroundColor: cardBg, border: `1px solid ${cardBorder}` }}>
                <p className="text-sm font-black tracking-widest" style={{ color: muted }}>{item.num} / 04</p>
                <h3 className="mt-2 text-lg font-black">{item.title}</h3>
                {item.text && <p className="mt-2 text-sm leading-relaxed" style={{ color: muted }}>{item.text}</p>}
              </div>
            ))}
          </div>
        </section>

        {/* the whole range */}
        <section id="range" className="mt-20">
          <h2 className="text-3xl font-black">{t('range.title')}</h2>
          <p className="mt-2 max-w-2xl" style={{ color: muted }}>{t('range.subtitle')}</p>
          <ul className="mt-8 flex flex-col gap-3">
            {PRODUCTS.map((p) => {
              const c = COLOURS.find((x) => x.id === p.colourId)!
              return (
                <li
                  key={p.id}
                  className="flex flex-wrap items-center gap-4 rounded-2xl px-5 py-4"
                  style={{ backgroundColor: cardBg, border: `1px solid ${cardBorder}` }}
                >
                  <span className="h-10 w-10 shrink-0 rounded-full border-2" style={{ backgroundColor: c.hex, borderColor: cardBorder }} aria-hidden="true" />
                  <span className="min-w-0 flex-1">
                    <span className="block font-black">{t(p.nameKey)}</span>
                    <span className="block text-sm" style={{ color: muted }}>{t(c.nameKey)}</span>
                  </span>
                  <span className="font-black">
                    {money(p.price)}
                    {p.was !== undefined && (
                      <span className="ms-2 text-sm font-bold line-through" style={{ color: muted }}>{money(p.was)}</span>
                    )}
                  </span>
                  <button
                    type="button"
                    onClick={() => pickProduct(p.id)}
                    className="rounded-xl px-4 py-2 text-sm font-black"
                    style={{ backgroundColor: btnBg, color: btnFg }}
                  >
                    {t('range.view')}
                  </button>
                </li>
              )
            })}
          </ul>
          <button
            type="button"
            onClick={() => document.getElementById('more')?.scrollIntoView({ behavior: 'smooth' })}
            className="mt-6 inline-flex items-center gap-2 rounded-xl px-6 py-3 text-base font-black shadow-lg transition-transform hover:scale-[1.02]"
            style={{ backgroundColor: btnBg, color: btnFg }}
          >
            {t('range.shopAll')} <ArrowDown size={18} weight="bold" />
          </button>
        </section>

        {/* more products */}
        <section id="more" className="mt-20">
          <h2 className="text-3xl font-black">{t('more.title')}</h2>
          <p className="mt-2 max-w-2xl" style={{ color: muted }}>{t('more.subtitle')}</p>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {PRODUCTS.filter((p) => p.id !== product.id).map((p) => {
              const c = COLOURS.find((x) => x.id === p.colourId)!
              return (
                <article
                  key={p.id}
                  className="cursor-pointer overflow-hidden rounded-3xl transition-transform hover:-translate-y-1"
                  style={{ backgroundColor: cardBg, border: `1px solid ${cardBorder}` }}
                  onClick={() => pickProduct(p.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') pickProduct(p.id)
                  }}
                >
                  <div className="p-4" style={{ backgroundColor: c.hex, transition: 'background-color 700ms ease' }}>
                    <div className="mx-auto max-w-[180px]">
                      <Jacket colour={c} label={t(p.nameKey)} />
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="font-black">{t(p.nameKey)}</h3>
                      <span className="whitespace-nowrap font-black">
                        {money(p.price)}
                        {p.was !== undefined && (
                          <span className="ms-2 text-sm font-bold line-through" style={{ color: muted }}>{money(p.was)}</span>
                        )}
                      </span>
                    </div>
                    <p className="mt-1 text-sm" style={{ color: muted }}>{t(p.descKey)}</p>
                    <span className="mt-3 inline-flex items-center gap-1 text-sm font-bold underline underline-offset-4">
                      {t('ui.viewProduct')} <ArrowDown size={14} weight="bold" />
                    </span>
                  </div>
                </article>
              )
            })}
          </div>
        </section>

        {/* reviews */}
        <section id="reviews" className="mt-20">
          <h2 className="text-3xl font-black">{t('reviews.title')}</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {reviews.map((r) => (
              <figure key={r.name} className="rounded-3xl p-6" style={{ backgroundColor: cardBg, border: `1px solid ${cardBorder}` }}>
                <div className="flex gap-1" aria-label="5 out of 5 stars">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <Star key={i} size={18} weight="fill" color="#f59e0b" />
                  ))}
                </div>
                <blockquote className="mt-3 leading-relaxed">“{r.text}”</blockquote>
                <figcaption className="mt-4 text-sm font-bold">
                  {r.name} <span className="font-medium" style={{ color: muted }}>· {t('reviews.verified')}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      </main>

      {/* footer */}
      <footer className="border-t" style={{ borderColor: cardBorder, backgroundColor: colour.dark ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.3)' }}>
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-2">
          <div>
            <p className="text-2xl font-black">{t('app.name')}</p>
            <p className="mt-2 text-sm" style={{ color: muted }}>{t('app.demo')}</p>
            <p className="mt-4 text-sm">{t('footer.rights')}</p>
            <p className="mt-1 text-xs" style={{ color: muted }}>{t('footer.demoNote')}</p>
          </div>
          <div>
            <h3 className="text-lg font-black">{t('footer.newsletter')}</h3>
            <p className="mt-1 text-sm" style={{ color: muted }}>{t('footer.newsletterText')}</p>
            {newsDone ? (
              <p className="mt-4 flex items-center gap-2 font-bold" role="status">
                <Check size={18} weight="bold" /> {t('footer.success')}
              </p>
            ) : (
              <form
                className="mt-4 flex flex-wrap gap-2"
                onSubmit={(e) => {
                  e.preventDefault()
                  subscribe()
                }}
              >
                <label htmlFor="news-email" className="sr-only">{t('bag.email')}</label>
                <input
                  id="news-email"
                  type="email"
                  value={newsEmail}
                  onChange={(e) => {
                    setNewsEmail(e.target.value)
                    setNewsError(false)
                  }}
                  placeholder={t('footer.placeholder')}
                  className="min-w-0 flex-1 rounded-xl px-4 py-3 text-sm outline-none"
                  style={{ backgroundColor: chipBg, color: ink, border: `1px solid ${cardBorder}` }}
                />
                <button type="submit" className="rounded-xl px-5 py-3 text-sm font-black" style={{ backgroundColor: btnBg, color: btnFg }}>
                  {t('footer.subscribe')}
                </button>
              </form>
            )}
            {newsError && <p className="mt-2 text-sm font-bold" role="alert">{t('footer.invalid')}</p>}
          </div>
        </div>
      </footer>

      {/* bag drawer */}
      {bagOpen && (
        <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label={t('bag.title')}>
          <button type="button" aria-label={t('ui.close')} className="absolute inset-0 bg-black/50" onClick={() => setBagOpen(false)} />
          <aside className="relative flex h-full w-full max-w-md flex-col overflow-y-auto bg-white text-neutral-900 shadow-2xl" style={{ insetInlineEnd: 0 }}>
            <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
              <h2 className="text-xl font-black">{t('bag.title')}</h2>
              <button type="button" aria-label={t('ui.close')} onClick={() => setBagOpen(false)} className="rounded-full p-2 hover:bg-neutral-100">
                <X size={20} weight="bold" />
              </button>
            </div>

            {orderNo ? (
              <div className="flex flex-1 flex-col items-start gap-3 px-5 py-8">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  <Check size={28} weight="bold" />
                </span>
                <h3 className="text-2xl font-black">{t('bag.orderPlaced')}</h3>
                <p className="text-sm text-neutral-600">
                  {t('bag.orderNumber')}: <strong>{orderNo}</strong>
                </p>
                <p className="text-sm text-neutral-600">{t('bag.orderThanks')}</p>
                <button
                  type="button"
                  onClick={() => {
                    setOrderNo('')
                    setBagOpen(false)
                  }}
                  className="mt-2 rounded-xl bg-neutral-900 px-5 py-3 text-sm font-black text-white"
                >
                  {t('bag.continueShopping')}
                </button>
              </div>
            ) : bag.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-2 px-5 py-12 text-center">
                <ShoppingBag size={40} weight="duotone" className="text-neutral-400" />
                <p className="font-bold">{t('bag.empty')}</p>
                <p className="text-sm text-neutral-500">{t('bag.emptyHint')}</p>
                <button
                  type="button"
                  onClick={() => setBagOpen(false)}
                  className="mt-3 rounded-xl bg-neutral-900 px-5 py-3 text-sm font-black text-white"
                >
                  {t('bag.continueShopping')}
                </button>
              </div>
            ) : (
              <div className="flex flex-1 flex-col px-5 py-5">
                <ul className="flex flex-col gap-4">
                  {bag.map((item) => {
                    const p = PRODUCTS.find((pr) => pr.id === item.productId)!
                    const c = COLOURS.find((x) => x.id === p.colourId)!
                    return (
                      <li key={`${item.productId}-${item.size}`} className="flex gap-3 rounded-2xl border border-neutral-200 p-3">
                        <div className="w-20 shrink-0 rounded-xl p-1" style={{ backgroundColor: c.hex }}>
                          <Jacket colour={c} label={t(p.nameKey)} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-black">{t(p.nameKey)}</p>
                          <p className="text-sm text-neutral-500">
                            {t(c.nameKey)} · {t(`sizes.${item.size.toLowerCase()}`)}
                          </p>
                          <div className="mt-2 flex items-center gap-2">
                            <button type="button" aria-label="decrease" onClick={() => setItemQty(item.productId, item.size, item.qty - 1)} className="rounded-lg border border-neutral-300 p-1.5 hover:bg-neutral-100">
                              <Minus size={14} weight="bold" />
                            </button>
                            <span className="w-6 text-center font-bold">{item.qty}</span>
                            <button type="button" aria-label="increase" onClick={() => setItemQty(item.productId, item.size, item.qty + 1)} className="rounded-lg border border-neutral-300 p-1.5 hover:bg-neutral-100">
                              <Plus size={14} weight="bold" />
                            </button>
                            <button
                              type="button"
                              aria-label={t('bag.remove')}
                              onClick={() => setItemQty(item.productId, item.size, 0)}
                              className="ms-auto rounded-lg p-1.5 text-red-600 hover:bg-red-50"
                            >
                              <Trash size={16} weight="bold" />
                            </button>
                          </div>
                        </div>
                        <p className="font-black">{money(p.price * item.qty)}</p>
                      </li>
                    )
                  })}
                </ul>

                <div className="mt-6 flex items-center justify-between border-t border-neutral-200 pt-4 text-lg font-black">
                  <span>{t('bag.subtotal')}</span>
                  <span>{money(subtotal)}</span>
                </div>

                <form
                  className="mt-5 flex flex-col gap-3"
                  onSubmit={(e) => {
                    e.preventDefault()
                    placeOrder()
                  }}
                >
                  <h3 className="font-black">{t('bag.checkout')}</h3>
                  <label className="flex flex-col gap-1 text-sm font-bold">
                    {t('bag.name')}
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value)
                        setNameError(false)
                      }}
                      placeholder={t('bag.namePlaceholder')}
                      className="rounded-xl border border-neutral-300 px-4 py-3 font-normal outline-none focus:border-neutral-900"
                    />
                    {nameError && <span className="font-bold text-red-600" role="alert">{t('bag.invalidName')}</span>}
                  </label>
                  <label className="flex flex-col gap-1 text-sm font-bold">
                    {t('bag.email')}
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value)
                        setEmailError(false)
                      }}
                      placeholder={t('bag.emailPlaceholder')}
                      className="rounded-xl border border-neutral-300 px-4 py-3 font-normal outline-none focus:border-neutral-900"
                    />
                    {emailError && <span className="font-bold text-red-600" role="alert">{t('bag.invalidEmail')}</span>}
                  </label>
                  <button type="submit" className="mt-1 rounded-xl bg-neutral-900 px-5 py-3.5 font-black text-white">
                    {t('bag.placeOrder')} — {money(subtotal)}
                  </button>
                  <p className="text-xs text-neutral-500">{t('bag.demoNote')}</p>
                </form>
              </div>
            )}
          </aside>
        </div>
      )}
    </div>
  )
}
