# Caso de portafolio: sistema POS de escritorio

> **Ubicación principal** de lo que el sitio puede y no puede afirmar sobre el
> caso POS. La feature 002 toma sus textos de aquí. Revisado el 2026-11-05.

## 1. Fuente y reglas

- **Fuente:** repositorio privado `Julio-orellana/sistema-pos`, rama por
  defecto, commit `ced39d4` (clon superficial de **solo lectura**). No se
  modificó, no se instalaron dependencias y **no se ejecutó ninguna prueba**.
- No se leyeron archivos `.env` ni el `CLAUDE.md` de ese repositorio (1,1 MB);
  se revisaron `README.md`, `package.json`, `electron-builder.yml`,
  `spec/constitution/roadmap.md` (§1) y la estructura de `src/`.
- **Prohibido publicar** sin autorización escrita (P-02, P-03): el nombre
  comercial del producto, el nombre del cliente, capturas identificables e
  información comercial. Este documento tampoco los repite.
- **Descripción pública autorizada:** «Sistema POS de escritorio para un
  comercio de productos agrícolas en Guatemala.» / «Desktop POS system for an
  agricultural products business in Guatemala.»

## 2. Qué es

Aplicación **de escritorio** (no web) con Electron, React, TypeScript y
SQLite local (`better-sqlite3`), arquitectura **offline-first** y respaldo en
la nube. Evidencia: `package.json` (`electron`, `react`, `better-sqlite3`,
`zod`, `decimal.js`), `electron-builder.yml` (destino `nsis` para Windows),
`src/main/{database,domain,impresora,recibo,restauracion,sincronizacion}`.

## 3. Capacidades documentadas en el repositorio

Documentadas, **no verificadas en ejecución** por THIS JULIO. Se presentan
como «funcionalidades del sistema», nunca como «probadas en producción».

| Capacidad | Evidencia en el repositorio |
|---|---|
| Operación local | SQLite local en el equipo; `src/main/database` |
| Usuarios y roles | `src/main/domain/usuarios`; la hoja de ruta indica dos roles con PIN |
| Autorización remota TOTP | `spec/features/003-anulacion-autorizacion-remota`; módulos con `totp` |
| Gestión de caja | `src/main/domain/caja`; historial de cajas |
| Catálogo e inventario | `src/main/domain/catalogo`; `spec/features/004`, `006` |
| Ventas y descuentos por rol | `src/main/domain/venta`; topes de descuento por rol |
| Recibos y soporte de impresión | `src/main/recibo`, `src/main/impresora`; `docs/GUIA-IMPRESORA.md` |
| Reportes y auditoría | `src/main/domain/reportes`; asientos de auditoría |
| Respaldo en la nube | `src/main/sincronizacion`, `src/main/restauracion` (envío de subida y restauración) |
| Instalador para Windows | `electron-builder.yml`, destino NSIS |

## 4. Lo que el sitio NO afirma

- Multi-sucursal, SaaS, sincronización entre terminales, facturación fiscal
  electrónica, ventas a crédito. La propia hoja de ruta del repositorio
  declara que no existen todavía.
- Que la impresión física, el comportamiento en el hardware real del
  cliente, el rendimiento en su equipo o los atajos en Windows estén
  verificados: el repositorio los lista como **pendientes de verificación en
  el hardware real**.
- Cifras de uso, ventas, clientes o resultados.

## 5. Arquitecturas que se ofrecen como servicio

Cloud, local e híbrida son **alternativas de diseño para cada cliente**
(componente `Deploy` del diseño), no capacidades del POS existente. El caso
real corresponde a una arquitectura local con respaldo en la nube; el sitio
no lo convierte en una demostración de las tres.
