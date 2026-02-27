# FileSearch Gemini — Design System

## Direction & Feel

**Who:** ML/DevOps engineer monitoreando infraestructura RAG. Verbo central: monitorear.
**Feel:** Dark command center. Precisión técnica, no decoración. Piensa Vercel/Linear pero para operaciones de datos.
**Density:** Media — suficiente información de un vistazo, sin abrumar.

---

## Palette

| Token | Value | Uso |
|---|---|---|
| Canvas | `#080d1a` | Fondo de página |
| Surface 1 | `#0d1526` | Cards, header, paneles |
| Surface 2 | `#111c30` | Hover de cards |
| Surface 3 | `#141d35` | Elevated (modales, dropdowns) |
| Surface 4 | `#16213b` | Active states |
| Accent | `#00d4aa` | Primary, links, brand mark |
| Accent dim | `rgba(0,212,170,0.12)` | Fondos de accent |
| Active | `#22c55e` | Documentos activos, éxito |
| Pending | `#f59e0b` | Documentos pendientes, advertencia |
| Failed | `#ef4444` | Documentos fallidos, error |
| Text primary | `#e8eeff` | Headings, valores |
| Text secondary | `rgba(232,238,255,0.58)` | Labels de soporte |
| Text tertiary | `rgba(232,238,255,0.36)` | Metadatos |
| Text muted | `rgba(232,238,255,0.22)` | Placeholders, deshabilitado |
| Border default | `rgba(255,255,255,0.08)` | Separadores estándar |
| Border subtle | `rgba(255,255,255,0.05)` | Separadores internos |
| Border emphasis | `rgba(255,255,255,0.18)` | Hover de borders |

---

## Depth Strategy

**Borders-only.** Sin sombras. La jerarquía se construye con luminosidad de superficie.

- Canvas → Surface 1: borde `rgba(255,255,255,0.07)`
- Surface 1 → Surface 2: borde `rgba(255,255,255,0.06)`
- Hover de card: borde cambia a `rgba(0,212,170,0.2)` + fondo sube a Surface 2

---

## Typography

**Fuente:** Inter via `next/font/google`
**Variable CSS:** `--font-inter`

| Nivel | Size | Weight | Color | Uso |
|---|---|---|---|---|
| Page title | 20–22px | 700 | `#e8eeff` | Headings de página |
| Card title | 15px | 600 | `#e8eeff` | Nombres de store/doc |
| Body | 13px | 400 | `rgba(232,238,255,0.58)` | Texto de soporte |
| Label | 12px | 500 | `rgba(232,238,255,0.35)` | Stats, metadatos |
| Micro | 11px | 400 | monospace | IDs, mimeTypes |
| Section header | 10px | 600 | `rgba(232,238,255,0.3)` | uppercase, tracking 0.08em |

---

## Spacing

Base unit: **4px**

| Escala | Value | Uso |
|---|---|---|
| xs | 4px | Gap mínimo entre elementos inline |
| sm | 8px | Gap entre botones, iconos + texto |
| md | 12–14px | Padding interno de stats, gaps de grid |
| lg | 18–20px | Padding interno de cards |
| xl | 24–28px | Padding de página |
| 2xl | 32px | Padding horizontal de página |

---

## Signature: Health Bar

El elemento distintivo del producto. Una barra de 3–6px dividida proporcionalmente en tres segmentos coloreados: verde (activos), ámbar (pendientes), rojo (fallidos).

```tsx
function HealthBar({ active, pending, failed }) {
  const total = active + pending + failed;
  if (total === 0) return <div style={{ height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.06)' }} />;
  return (
    <div style={{ height: 3, borderRadius: 2, overflow: 'hidden', display: 'flex', gap: 1 }}>
      {active > 0  && <div style={{ flex: active,  background: '#22c55e', minWidth: 3 }} />}
      {pending > 0 && <div style={{ flex: pending, background: '#f59e0b', minWidth: 3 }} />}
      {failed > 0  && <div style={{ flex: failed,  background: '#ef4444', minWidth: 3 }} />}
    </div>
  );
}
```

- **En store cards:** 3px, debajo del nombre
- **En StoreDetailPage:** 6px, como bloque "Corpus Health" prominente

---

## State Indicators

Nunca usar Ant Design `<Tag>` para estados de dominio. Usar puntos coloreados con label:

```tsx
// Pending: pulso animado (CSS class "pulse")
// Active/Done: punto sólido sin animación
// Failed/Error: punto sólido rojo
<span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
  <span className={isPending ? 'pulse' : undefined}
    style={{ width: 6, height: 6, borderRadius: '50%', background: color }} />
  <span style={{ color, fontWeight: 500 }}>{label}</span>
</span>
```

CSS para el pulso en `globals.css`:
```css
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.35; } }
.pulse { animation: pulse 1.6s ease-in-out infinite; }
```

---

## Component Patterns

### Store Card (grid, no tabla)
- Background: Surface 1 → Surface 2 en hover
- Border: default → accent dim en hover
- Estructura: [ID monospace + delete btn] → [nombre] → [health bar] → [stat dots] → [footer: size · fecha]
- Delete button: `opacity: 0.4` por defecto, `1` en hover de card
- Transición: `background 0.15s, border-color 0.15s`

### Corpus Health Block (detail page)
- Card Surface 1 con padding `20px 24px`
- Section header en micro uppercase
- Health bar 6px
- Stats row: números grandes coloreados + label uppercase en micro

### Page Header
- Title: 20–22px 700, tracking `-0.02em`
- Subtitle: conteo en text tertiary
- Actions: botones size `small`, alineados `flex-end`

### AppShell Header
- Height: 52px, background Surface 1, `border-bottom: 1px solid rgba(255,255,255,0.07)`
- Brand mark: cuadrado 7×7 teal con `box-shadow: 0 0 8px rgba(0,212,170,0.6)`
- `position: sticky; top: 0; z-index: 100`

### Empty State
- Grid de 9 puntos (3×3), el central en teal semitransparente
- Título en text secondary, descripción en text tertiary
- CTA button primary

### Login Page
- Canvas `#080d1a` + grilla de fondo `rgba(0,212,170,0.03)` cada 40px
- Card Surface 1, border-radius 12px, padding 28px
- Brand icon: container 40×40 con cuadrado teal interior

---

## Ant Design Token Config

```ts
algorithm: theme.darkAlgorithm,
token: {
  colorPrimary: '#00d4aa',
  colorBgBase: '#080d1a',
  colorBgContainer: '#0d1526',
  colorBgElevated: '#141d35',
  colorBgLayout: '#080d1a',
  colorBorder: 'rgba(255,255,255,0.08)',
  colorText: '#e8eeff',
  borderRadius: 6,
  borderRadiusLG: 8,
  colorSuccess: '#22c55e',
  colorWarning: '#f59e0b',
  colorError: '#ef4444',
}
```

Overrides de componente importantes:
- `Table.headerBg`: `rgba(255,255,255,0.025)` + headers uppercase via CSS global
- `Input.colorBgContainer`: `rgba(255,255,255,0.04)` (inputs "inset")
- `Button.defaultBg`: `rgba(255,255,255,0.05)` para botones secundarios

---

## globals.css (patrones clave)

```css
/* Scrollbar */
::-webkit-scrollbar { width: 5px; }
::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }

/* Table headers */
.ant-table-wrapper .ant-table-thead > tr > th {
  font-size: 11px !important;
  text-transform: uppercase !important;
  letter-spacing: 0.06em !important;
}

/* Code text */
.ant-typography code {
  background: rgba(255,255,255,0.06) !important;
  border: 1px solid rgba(255,255,255,0.08) !important;
  color: rgba(232,238,255,0.7) !important;
}
```
