# Contexto del proyecto — Ahorro Fortuner

Este archivo resume las decisiones y el estado del proyecto para retomar el trabajo.

## Qué es

PWA en español, mobile-first, sin backend. Todos los datos se guardan en el dispositivo del usuario (localStorage). Está desplegada en GitHub Pages y se instala en el celular vía Obtainium.

- Repo: `ORIONSSAUCES/ahorro-fortuner`
- Usuario GitHub: `orionssauces`
- URL live: https://orionssauces.github.io/ahorro-fortuner/
- Ya está instalada y en uso en el celular.

## Estructura de la app

La app tiene **dos pestañas** (barra inferior de navegación):

1. **🚙 Ahorro** — la pantalla original (meta Toyota Fortuner).
2. **💳 Finanzas** — manejo de finanzas personales del mes (agregada después).

Todo vive en un solo archivo `index.html` (HTML + CSS + JS). `sw.js` es el service worker y `manifest.json` la config de PWA/instalación/widget.

## Pestaña Ahorro (objetivo original)

Ayudar a ahorrar para comprar una **Toyota Fortuner** (valor al contado ~220-240 millones de guaraníes; posible que baje a ~190M según el mercado local paraguayo). Meta de compra: dentro de ~5 años (a los 32-35 años del usuario).

Funciones:
- Registrar movimientos: depósito o retiro, con monto, fecha y nota.
- Total acumulado, restante y % de progreso con barra.
- Estimación de tiempo restante según ritmo real (total ahorrado ÷ días desde el primer movimiento).
- Mensajes motivadores, meta mensual, datos de cuenta bancaria, historial editable.
- Respaldo export/import en JSON.

Estrategia real del usuario (todo se registra junto como movimientos únicos, sin categorías ni comisiones):
- Ahorro programado del banco: Gs. 300.000/mes, 60 meses, 8% anual, comisión fija de cancelación anticipada Gs. 50.000. Vencimiento estimado ~22.006.261.
- Cuenta libre (extras): venta de vehículo (~12M), comisión por importación (~15M), ganancias del negocio de salsas.

## Pestaña Finanzas (agregada)

Objetivo: control mensual de ingresos, cuentas a pagar y gastos. Datos en localStorage bajo la clave `fin_v1`.

Incluye:
- **Ingresos:** salario mensual + quincena/extra (se suman).
- **Gastos fijos:** nombre, monto mensual, día de vencimiento, "marcar pagado" por mes (se resetea cada mes calendario, clave `paid["YYYY-MM"]`).
- **Préstamos:** cuota (fija o variable), fecha de finalización, cuotas totales / pagadas / faltan, con barra de avance. "Marcar pagado" incrementa las cuotas pagadas del mes.
- **Gastos variables del mes:** categoría (combustible, comida, súper, etc.), monto, fecha, nota y **foto de factura** (se comprime en canvas a ~900px y se guarda como dataURL junto al gasto). Desglose por categoría.
- **Escanear factura (OCR):** botón que abre la cámara, corre OCR en el dispositivo con **Tesseract.js** (cargado desde CDN, `spa`), adivina el monto (heurística: busca números en líneas con "total/importe/a pagar", evita "subtotal"; fallback al mayor número plausible) y la categoría por palabras clave, y abre el gasto **pre-cargado** para que el usuario confirme/corrija antes de guardar. Requiere internet la primera vez (baja el motor); el resto de la app sigue offline. El monto siempre es confirmable a mano.
- **Resumen del mes:** ingresos − fijos − cuotas − variables = "te sobra este mes".
- **Recordatorios:** lista de próximos pagos con estado (vencido / vence hoy / en X días), insignia con número de pendientes en la pestaña, badge en el ícono de la app.

### Notificaciones (best-effort)
- Pide permiso con el botón "Activar".
- Avisos confiables: al abrir la app (in-app + notificación inmediata de lo vencido/de hoy) e insignia.
- Aviso con la app cerrada: intento con `TimestampTrigger` si el navegador lo soporta; NO está garantizado en Android instalado (limitación de PWA sin servidor push).
- El service worker maneja `notificationclick` y abre/enfoca la pestaña Finanzas.

## Decisiones de diseño tomadas

- App simple, sin backend, todo en el dispositivo.
- La pestaña Ahorro asume plata quieta (no calcula interés compuesto). Posible mejora futura: simular rendimiento.
- Finanzas: foto de factura con OCR opcional (Tesseract.js en el dispositivo) que pre-carga el monto, siempre confirmable a mano. Notificaciones best-effort.
- Fotos comprimidas; si se llena localStorage, el gasto se guarda sin foto y avisa.

## Respaldo

Export/import (JSON, versión 2) incluye ahora tanto los datos de ahorro (`goal`, `cfg`, `moves`) como los de finanzas (`fin`).

## Recordatorio automático

Hay una tarea programada en Cowork (`recordatorio-finanzas`) que avisa una vez por mes (día 25, 9:00) para cargar los gastos variables y revisar vencimientos antes de fin de mes. Es un aviso desde la PC; las notificaciones dentro de la app siguen siendo el recordatorio principal.

## Posibles mejoras a futuro (ideas)

- Interés compuesto en la pestaña Ahorro.
- Ver meses anteriores en Finanzas (hoy solo muestra el mes actual para variables).
- Gráfico de gastos por categoría / mes.
- Ajustes de colores/textos.

## Cómo actualizar

Cada cambio se sube con git:

```
git add . ; git commit -m "mensaje" ; git push
```

GitHub Pages se actualiza en ~1 min. En el celular, cerrar y reabrir la app una vez por el service worker (cache actual: `ahorro-v4`).
