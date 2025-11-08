# eMercado

> Plataforma moderna de comercio electrónico desarrollada como Proyecto Final del programa Jóvenes a Programar - Plan Ceibal

---

## Tabla de contenidos

- [Sobre el proyecto](#sobre-el-proyecto)
- [Características principales](#características-principales)
- [Tecnologías utilizadas](#tecnologías-utilizadas)
- [Instalación y uso](#instalación-y-uso)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Documentación técnica](#documentación-técnica)
- [Equipo de desarrollo](#equipo-de-desarrollo)
- [Enlaces y recursos](#enlaces-y-recursos)

---

## Sobre el proyecto

eMercado es una plataforma completa de comercio electrónico que ofrece una experiencia de compra **moderna, intuitiva, simple y efectiva**. El proyecto implementa todas las funcionalidades esenciales de un e-commerce profesional, incluyendo catálogo de productos, sistema de carrito, checkout con múltiples métodos de pago, gestión de perfil de usuario y sistema de favoritos.

### Objetivo del proyecto

El desafío principal fue lograr que estas características se integraran en un único producto coherente. En el e-commerce, la **experiencia de usuario** es un aspecto clave: la solución debe funcionar de la forma más fluida posible, de lo contrario los clientes se marcharán.

Si bien la plataforma trata sobre compra y venta de bienes de cualquier tipo, nos concentramos únicamente en las funcionalidades de e-mercado **para los COMPRADORES**.

### Destacados

- **Experiencia de usuario optimizada** con diseño responsive mobile-first
- **Sistema de temas** claro/oscuro con persistencia
- **PWA ready** con Service Worker para modo offline
- **Optimizado para SEO y accesibilidad** (WCAG AA)
- **Performance optimizada** con lazy loading, caching y debouncing

---

## Características principales

### Autenticación y gestión de sesión

- Sistema de login con validación de email (regex) y contraseña robusta
- Gestión de sesión con expiración automática (24 horas)
- Función "Recordarme" con almacenamiento local
- Protección de rutas y logout con limpieza de datos
- Toggle de mostrar/ocultar contraseña

### Catálogo y navegación de productos

- **Filtros avanzados**: búsqueda en tiempo real, rango de precio, marca, modelo
- **Ordenamiento múltiple**: por precio, relevancia, cantidad vendida
- **Paginación inteligente** con 9 productos por página
- **Sincronización desktop/mobile** de filtros con bridge bidireccional
- **Skeleton loading** durante carga de datos
- **Highlighting** de términos de búsqueda
- **Cache de productos** (5 minutos) para optimizar performance

### Detalle de producto

- Galería de imágenes interactiva con navegación por flechas
- Soporte para swipe touch en dispositivos móviles
- Sistema de calificaciones con estrellas visuales
- Comentarios de usuarios con validación anti-duplicados
- Productos relacionados clickeables
- Agregar al carrito con cantidad personalizada

### Carrito de compras

- Badge global sincronizado en header y mobile
- Manipulación de cantidades (botones +/-, input directo)
- Conversión automática USD/UYU con tasa fija
- Cálculo automático de subtotal, envío y total
- Tres tipos de envío: Premium (15%), Express (7%), Standard (5%)
- Eliminar productos con confirmación
- Persistencia en localStorage con actualización en tiempo real

### Sistema de checkout

- Página de checkout completa con flujo optimizado
- **Múltiples métodos de pago**:
  - Tarjeta de crédito y débito (validación completa)
  - Transferencia bancaria
  - Mercado Pago
  - Criptomonedas (Bitcoin, Ethereum, USDT)
- Validación de tarjetas en tiempo real con detección automática
- Formularios responsive adaptados a móviles
- Página de confirmación con resumen de orden
- Opción de guardar método de pago

### Gestión de perfil y pedidos

- **Perfil de usuario**:

  - Formulario con datos personales (nombre, apellido, email, teléfono)
  - Foto de perfil con preview, conversión a base64 y persistencia
  - Avatar sincronizado en header y sidebar
  - Sistema de tabs para organizar secciones

- **Historial de pedidos**:

  - Listado completo de pedidos realizados
  - Estados visuales: Pendiente, Confirmado, Enviado, Entregado
  - Detalles: fecha, total, método de pago, estado
  - Filtrado y ordenamiento

- **Lista de favoritos/wishlist**:
  - Toggle de favoritos en tarjetas de productos con animación
  - Página dedicada con diseño horizontal compacto
  - Persistencia sincronizada globalmente
  - Eliminación rápida y navegación directa a productos

### Interfaz y diseño

- **Sistema de temas**: Modo claro/oscuro con toggle flotante
- **Design system completo**: Variables CSS organizadas y documentadas
- **Responsive design**: 7+ breakpoints (desde 320px hasta desktop)
- **Grid adaptativo**: 3 → 2 → 1 columnas según dispositivo
- **Componentes UI**: Modales personalizados, dropdowns, badges, spinners
- **Animaciones CSS**: Shimmer, fadeIn, pulse y transiciones suaves
- **Empty states** en carrito, comentarios y favoritos

### Optimización y performance

- **Lazy loading** de imágenes con transición de opacidad
- **Service Worker** para caching de assets y modo offline
- **Preload y preconnect** de recursos críticos
- **Fuentes optimizadas** con `font-display: swap`
- **Scripts con defer** para no bloquear rendering
- **Infinite scroll** con Intersection Observer
- **Debounce en filtros** (250ms)
- **Cache de API** (5 minutos)
- **Error handling** robusto en todas las llamadas

### SEO y accesibilidad

- Meta tags optimizados (description, keywords, Open Graph)
- Structured data con JSON-LD para productos
- 65+ ARIA labels distribuidos estratégicamente
- Semántica HTML5 correcta (header, nav, main, section, article, aside, footer)
- Focus-visible para navegación por teclado
- Contraste de colores cumple WCAG AA
- Live regions (`aria-live="polite"`) para actualizaciones dinámicas

---

## Tecnologías utilizadas

### Frontend

- **HTML5** - Estructura semántica
- **CSS3** - Estilos con variables CSS y diseño responsive
- **JavaScript (ES6+)** - Lógica de aplicación vanilla
- **Bootstrap 5** - Framework CSS y componentes UI

### APIs y servicios

- **eMercado API** - API REST para catálogo, productos y comentarios
- **LocalStorage** - Persistencia de datos del lado del cliente
- **Service Worker** - Caching y funcionalidad offline

### Herramientas de desarrollo

- **Git & GitHub** - Control de versiones
- **Prettier** - Formateo de código
- **Trello** - Gestión de proyecto
- **Font Awesome** - Iconografía

---

## Instalación y uso

### Requisitos previos

- Navegador web moderno (Chrome, Firefox, Safari, Edge)
- Conexión a internet (para cargar datos de la API)

### Instalación

1. **Clonar el repositorio**:

   ```bash
   git clone https://github.com/yenifer-gonzalez/pfinal-jap-grupo1
   cd pfinal-grupo1
   ```

2. **Abrir la aplicación**:

   - Opción 1: Abrir `login.html` directamente en el navegador
   - Opción 2: Usar un servidor local (recomendado):

     ```bash
     # Con Python 3
     python -m http.server 8000

     # Con Node.js (npx)
     npx http-server -p 8000
     ```

   - Navegar a `http://localhost:8000/login.html`

3. **Credenciales de prueba**:
   - Email: `usuario@example.com` (cualquier email válido)
   - Contraseña: `test123` (mínimo 6 caracteres, 1 letra y 1 número)

### Navegación básica

1. **Login** → Ingresar con credenciales
2. **Catálogo** → Ver categorías y productos
3. **Productos** → Filtrar, ordenar y navegar
4. **Detalle** → Ver producto y agregar al carrito
5. **Carrito** → Revisar compra y proceder al checkout
6. **Checkout** → Seleccionar método de pago y confirmar
7. **Perfil** → Gestionar datos, ver pedidos y favoritos

---

## Estructura del proyecto

<details>
<summary>Ver estructura de archivos</summary>

```
pfinal-grupo1/
├── css/
│   ├── bootstrap.min.css        # Framework CSS
│   ├── cart.css                 # Carrito de compras
│   ├── categories.css           # Categorías
│   ├── checkout.css             # Checkout y métodos de pago
│   ├── home.css                 # Página principal
│   ├── login.css                # Login
│   ├── my-profile.css           # Perfil, pedidos y favoritos
│   ├── order-confirmation.css   # Confirmación de compra
│   ├── styles.css               # Estilos globales y componentes
│   └── variables.css            # Variables del sistema de diseño
│
├── js/
│   ├── cart.js                  # Lógica del carrito
│   ├── categories.js            # Navegación de categorías
│   ├── checkout.js              # Sistema de checkout y validación
│   ├── index.js                 # Página principal
│   ├── init.js                  # Configuración global y sesiones
│   ├── login.js                 # Autenticación
│   ├── my-profile.js            # Perfil, pedidos y favoritos
│   ├── order-confirmation.js    # Confirmación de orden
│   ├── product-info.js          # Detalle de producto
│   └── products.js              # Listado, filtros y paginación
│
├── img/                         # Imágenes del proyecto
├── webfonts/                    # Fuentes web
│
├── cart.html
├── categories.html
├── checkout.html
├── index.html
├── login.html
├── my-profile.html
├── order-confirmation.html
├── product-info.html
├── products.html
├── sw.js                        # Service Worker
│
└── README.md
```

</details>

---

## Documentación técnica

### Sistema de diseño

#### Paleta de colores

**Tema claro**:

- Primario: `#FF8C00` (Naranja) - Botones CTA, enlaces activos
- Secundario: `#274653` (Azul) - Headers, títulos
- Fondo: Gradiente `#FFFAF5` → `#E8F1F5` → `#D8E3E9`
- Texto: `#333333` (primario), `#666666` (secundario), `#999999` (terciario)

**Tema oscuro**:

- Automático con paletas invertidas
- Fondos: `#0F1417` → `#101A20` → `#0D1B22`
- Naranja ajustado: `#FF9A1A` para mejor legibilidad

#### Tipografía

- **Primaria**: Poppins - UI general
- **Secundaria**: Raleway - Headings destacados
- **Escala de tamaños**: 12px a 32px con line-heights adaptados

#### Variables CSS

El sistema cuenta con variables organizadas por categorías:

- Colores de marca y estados (error, success, warning, info)
- Paleta de texto jerárquica
- Escala de espaciado (4px a 64px)
- Radios de borde (6px, 12px, 16px)
- Animaciones y transiciones
- Efectos visuales (blur, opacity)

Ver detalles completos en [variables.css](css/variables.css)

#### Responsive design

**Breakpoints**:

- 320px: Móviles pequeños
- 480px: Móviles grandes
- 768px: Tablets
- 1024px: Desktop estándar
- 1200px: Desktop grande (max-width contenedor)

**Grid adaptativo**: `repeat(auto-fill, minmax(280px, 1fr))`

### API endpoints

La aplicación consume la API oficial de eMercado:

**Base URL**: `https://japceibal.github.io/emercado-api/`

<details>
<summary>Ver endpoints disponibles</summary>

#### Categorías

- `GET /cats/cat.json` - Listado de categorías

#### Productos

- `GET /cats_products/{categoryId}.json` - Productos por categoría
- `GET /products/{productId}.json` - Detalle de producto

#### Comentarios

- `GET /products_comments/{productId}.json` - Comentarios de producto

#### Carrito

- `GET /user_cart/{userId}.json` - Carrito del usuario

#### Otros

- `POST /sell/publish.json` - Publicar producto
- `POST /cart/buy.json` - Procesar compra

</details>

**Optimizaciones**:

- Cache de 5 minutos en productos por categoría
- Error handling con try-catch en todas las llamadas
- Loading states con skeleton screens

### Componentes principales

<details>
<summary>Sistema de modales</summary>

**Características**:

- Modales personalizados con callbacks
- Iconos de estado (success, warning, error)
- Overlay con animación fadeIn
- Botones de acción configurables
- Cierre con ESC y click fuera

**Uso**:

```javascript
showModal({
  icon: 'success',
  title: 'Producto agregado',
  message: 'Se agregó el producto al carrito',
  confirmText: 'Ver carrito',
  onConfirm: () => (window.location.href = 'cart.html'),
});
```

</details>

<details>
<summary>Sistema de caché</summary>

**Implementación**:

- Map para almacenar respuestas
- TTL de 5 minutos
- Invalidación automática por timestamp

**Beneficios**:

- Reduce llamadas a API
- Mejora tiempos de carga
- Experiencia más fluida

</details>

---

## Equipo de desarrollo

### Integrantes

- **Agustina de los Santos** - [@agusdelossantos](https://github.com/agusdelossantos) - Diseñadora UX/UI y Documentación
- **Yenifer González** - [@yenifer-gonzalez](https://github.com/yenifer-gonzalez) - Desarrolladora Frontend
- **Marcos Betancor** - [@marcosbeta23](https://github.com/marcosbeta23) - Desarrollador JavaScript Principal
- **Hernán Baldi** - [@hernan-baldi](https://github.com/hernan-baldi) - Funcionalidades de Perfil y Almacenamiento
- **Nahuel Regueira** - [@NRDEV1771](https://github.com/NRDEV1771) - Funcionalidades de Productos y Calificaciones

### Organización del trabajo

Gestión del proyecto con metodología ágil:

- **Tablero Trello**: [Ver tablero](https://trello.com/b/raegH2uJ/grupo-1-jap)

---

## Enlaces y recursos

### Documentación

- [API de eMercado](https://japceibal.github.io/emercado-api/)
- [Bootstrap 5 Docs](https://getbootstrap.com/docs/)
- [MDN Web Docs](https://developer.mozilla.org/)

### Programa

- [Jóvenes a Programar](https://jovenesaprogramar.edu.uy/)
- [Plan Ceibal](https://www.ceibal.edu.uy/)

### Herramientas

- [Git & GitHub](https://github.com/)
- [Trello](https://trello.com/)
- [Prettier](https://prettier.io/)

---

## Licencia

Este proyecto es parte del curso Jóvenes a Programar y está destinado a fines educativos.

---

**Proyecto Final - Desarrollo Web | Jóvenes a Programar 2025**

_Para más detalles técnicos, consultar los archivos de código fuente en las carpetas `js/` y `css/`_
