# Paleta de colores · EventsCatch

Última actualización: _(2025-XX-XX)_  
Esta paleta se definió para garantizar legibilidad (contraste AA mínimo 4.5:1), consistencia en modo claro/oscuro y escalabilidad del UI kit. Todos los colores se declaran en variables CSS (`--ec-*`) y deben consumirse desde Tailwind/Tokens, nunca en valores hex directos.

---

## 1. Identidad de marca

| Token | Hex (Light) | Hex (Dark) | Uso principal | Contraste recomendado |
| ----- | ----------- | ---------- | ------------- | --------------------- |
| `--ec-brand-500` | `#F4A723` | `#F4A723` | CTA primario, iconos destacados | Sobre superficies claras u oscuras con texto oscuro/blanco respectivamente (ratio ≥ 4.8:1 con `#111827` y `#F8FAFC`) |
| `--ec-brand-600` | `#D38512` | `#FFC153` | Hover/pressed | N/A |
| `--ec-brand-100` | `#FFF3E0` | `#3B2A17` | Badges suaves, fondos de chips | Ratio ≥ 7:1 con texto `brand-600` |

## 2. Paleta neutra

| Token | Light | Dark | Uso |
| ----- | ----- | ---- | --- |
| `--ec-neutral-950` | `#0F172A` | `#F8FAFC` | Texto primario |
| `--ec-neutral-700` | `#334155` | `#E2E8F0` | Texto secundario / iconos |
| `--ec-neutral-500` | `#64748B` | `#94A3B8` | Texto desactivado / bordes |
| `--ec-neutral-300` | `#CBD5F5` | `#475569` | Divisores, contornos suaves |
| `--ec-neutral-100` | `#EEF2FF` | `#1F2937` | Superficies sutiles |

## 3. Superficies y fondos

| Token | Light | Dark | Uso |
| ----- | ----- | ---- | --- |
| `--ec-bg-body` | `#F5F7FB` | `#0B1120` | Body global |
| `--ec-surface` | `#FFFFFF` | `#141C2F` | Tarjetas base, formularios |
| `--ec-surface-elevated` | `#F8FAFF` | `#1F293B` | Modales, nav |
| `--ec-surface-muted` | `#F0F3FA` | `#182235` | Chips, barras |

## 4. Colores de estado

| Token | Light | Dark | Uso |
| ----- | ----- | ---- | --- |
| `--ec-success-500` | `#199A6C` | `#4ADE80` | Toasters, badges positivos |
| `--ec-info-500` | `#2F6FEB` | `#60A5FA` | Alertas informativas |
| `--ec-warning-500` | `#FACC15` | `#FACC15` | Advertencias suaves |
| `--ec-danger-500` | `#E44F4F` | `#F87171` | Errores, estados críticos |

## 5. Tipografía y sombras

- Texto primario/CTA sobre brand: `#111827` (light) / `#0B1120` (dark) usando `var(--ec-text-on-brand)`.
- Sombras suaves unificadas:
  - Light: `0 24px 40px -24px rgba(15, 23, 42, 0.18)`
  - Dark: `0 24px 40px -24px rgba(2, 6, 23, 0.55)`

## 6. Gradientes

| Nombre | Valores | Uso |
| ------ | ------- | --- |
| `--ec-gradient-hero` | `linear-gradient(135deg, rgba(17, 24, 39, 0.96) 0%, rgba(15, 23, 42, 0.8) 55%, rgba(17, 24, 39, 0.92) 100%)` | Hero, background app dark |
| `--ec-gradient-hero-light` | `linear-gradient(135deg, rgba(13, 37, 63, 0.08) 0%, rgba(13, 37, 63, 0) 40%)` | Hero light |

## 7. Tokens derivados

Para consistencia con Tailwind, mapear:
- `background` → `var(--ec-bg-body)`
- `surface` → `var(--ec-surface)`
- `content` → `var(--ec-neutral-950/700 según contexto)`
- `border` → `var(--ec-neutral-300)`

> **Nota:** cualquier nuevo componente debe consumir variables y no definir colores hardcode. Mantener ratio mínimo AA en botones y enlaces.
