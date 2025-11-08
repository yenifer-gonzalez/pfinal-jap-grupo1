# eMercado - Proyecto e-Commerce

Este proyecto forma parte del **Proyecto Final de Desarrollo Web - Fase 2** del programa "Jóvenes a Programar" de Plan Ceibal.

**Sistema:** e-Mercado - Plataforma moderna, intuitiva, simple y efectiva de comercio electrónico.

## Características implementadas

### Autenticación y sesión

- **Login completo** con validación de email (regex) y contraseña robusta.
- **Validación de contraseña**: mínimo 6 caracteres, al menos una letra y un número.
- **Toggle mostrar/ocultar contraseña** con animación.
- **Función "Recordarme"** que guarda el email en localStorage.
- **Gestión de sesión** con expiración automática en 24 horas.
- **Protección de rutas** en todas las páginas (excepto login).
- **Logout global** con limpieza de datos.

### Catálogo y productos

- **Listado de categorías** con ordenamiento y filtros por cantidad.
- **Listado de productos** con consumo de API y cache de 5 minutos.
- **6 filtros avanzados**: búsqueda en tiempo real, precio (min/max), marca, modelo, ordenamiento.
- **Sincronización desktop/mobile** de filtros con bridge bidireccional.
- **Paginación completa** (9 productos por página) con navegación inteligente.
- **Skeleton loading** durante carga de datos.
- **Highlighting** de términos de búsqueda con `<mark>`.
- **Detalle de producto** con galería interactiva y navegación con flechas.
- **Swipe touch en galería** para dispositivos móviles.
- **Productos relacionados** clickeables.

### Sistema de calificaciones

- **Visualización de comentarios** con estrellas (llenas, media, vacías).
- **Formulario de calificaciones** locales con validación.
- **Verificación anti-duplicados** (un comentario por usuario).
- **Username limpio** (sin dominio @).
- **Animaciones** en nuevos comentarios agregados.

### Carrito de compras

- **Agregar productos** desde detalle con cantidad seleccionada.
- **Notificación toast** al agregar productos.
- **Badge global del carrito** sincronizado en header y mobile.
- **Manipulación de cantidades** (botones +/-, input directo).
- **Conversión de moneda** USD/UYU con tasa fija.
- **Cálculo automático** de subtotal, envío y total.
- **3 tipos de envío** (Premium 15%, Express 7%, Standard 5%).
- **Eliminar productos** con modal de confirmación.
- **Modal de pago completado** con opciones de navegación.
- **Persistencia en localStorage** con actualización en tiempo real.

### Perfil de usuario

- **Formulario de datos** (nombre, apellido, email, teléfono).
- **Foto de perfil** con preview, conversión a base64 y persistencia.
- **Botones** editar y eliminar foto.
- **Avatar sincronizado** en header y sidebar.
- **Sistema de tabs** para organizar secciones.
- **Validación de email** con regex.

### Interfaz y diseño

- **Sistema de temas** (modo claro/oscuro) con toggle flotante.
- **Persistencia del tema** en localStorage.
- **Variables CSS** organizadas por tema en [variables.css](css/variables.css).
- **Header responsive** con logo, navegación y dropdown de usuario.
- **Sidebar mobile** para navegación con overlay.
- **Footer** con links útiles.
- **Diseño responsive completo** con 7+ breakpoints (hasta 320px).
- **Grid adaptativo** (3 → 2 → 1 columnas según dispositivo).
- **Paleta naranja** (#FF8C00) con gradientes modernos.

### Optimizaciones

- **Cache de productos** (5 minutos) para reducir llamadas a API.
- **Debounce en filtros** (250ms) para mejor performance.
- **Lazy loading** de imágenes con transición de opacidad.
- **Renderizado modular** con funciones reutilizables.
- **Validación en tiempo real** en formularios.
- **Error handling** robusto con try-catch.

### Características adicionales

- **Favoritos visuales** (toggle de corazón en productos).
- **Modales personalizados** con iconos, callbacks y animaciones.
- **Dropdown de usuario** con Bootstrap.
- **Radio buttons custom** estilizados.
- **Spinner de carga** global.
- **Empty states** en carrito y comentarios.
- **Transiciones y animaciones CSS** (shimmer, fadeIn, pulse, etc.).
- **ARIA labels** para accesibilidad.
- **Semántica HTML5** correcta.

## Estructura del Proyecto

```
pfinal-grupo1/
├── css/
│   ├── bootstrap.min.css        # Framework CSS
│   ├── cart.css                 # Estilos del carrito de compras
│   ├── categories.css           # Estilos de categorías
│   ├── dropzone.css             # Estilos para carga de archivos
│   ├── font-awesome.min.css     # Iconos Font Awesome
│   ├── home.css                 # Estilos de la página principal
│   ├── login.css                # Estilos del login
│   ├── my-profile.css           # Estilos del perfil de usuario
│   ├── sell.css                 # Estilos de página de venta
│   ├── styles.css               # Estilos globales y sistema de diseño
│   └── variables.css            # Variables CSS del sistema de diseño
│
├── js/
│   ├── bootstrap.bundle.min.js  # Framework JavaScript
│   ├── cart.js                  # Lógica del carrito con modales
│   ├── categories.js            # Navegación de categorías
│   ├── dropzone.js              # Carga de archivos
│   ├── index.js                 # Página principal
│   ├── init.js                  # Configuración global y gestión de sesiones
│   ├── login.js                 # Autenticación avanzada
│   ├── my-profile.js            # Gestión de perfil de usuario
│   ├── product-info.js          # Detalle de producto, galería y calificaciones
│   ├── products.js              # Listado, filtros, paginación y cache
│   └── sell.js                  # Publicación de productos
│
├── img/                         # Imágenes del proyecto
├── webfonts/                    # Fuentes web
│
├── cart.html                    # Carrito de compras
├── categories.html              # Listado de categorías
├── index.html                   # Página principal
├── login.html                   # Inicio de sesión
├── my-profile.html              # Perfil de usuario
├── product-info.html            # Detalle de producto
├── products.html                # Listado de productos
├── sell.html                    # Vender productos
│
├── .gitignore                   # Archivos ignorados por Git
├── .prettierrc                  # Configuración de Prettier
└── README.md                    # Documentación del proyecto
```

## Sistema de diseño

### Paleta de colores

#### Colores de marca

- **Primario**: `#FF8C00` (Naranja) - Botones CTA, enlaces activos
- **Primario oscuro**: `#E67E00` (Naranja hover/focus)
- **Secundario**: `#FFA500` (Naranja secundario) - Iconos, badges
- **Azul secundario**: `#274653` - Headers, títulos

#### Fondos y superficies

- **Gradiente de fondo**: `#FFFAF5` → `#E8F1F5` → `#D8E3E9` (Beige claro → Azul suave → Gris azulado)
- **Cards**: `#FFFFFF` (principal) / `#F8F8F8` (alternativo)

#### Paleta de texto jerárquica

- **Primario**: `#333333` - Títulos principales, contenido importante
- **Secundario**: `#666666` - Descripciones, subtítulos
- **Terciario**: `#999999` - Metadatos, fechas, información auxiliar
- **Muted**: `#CCCCCC` - Placeholders, texto deshabilitado

#### Dark Mode

- Sistema completo de dark mode implementado
- Inversión automática de paletas
- Fondos oscuros: `#0F1417` → `#101A20` → `#0D1B22`
- Naranja ajustado: `#FF9A1A` para mejor legibilidad

### Tipografía

- **Primaria**: `Poppins` - Para UI general
- **Secundaria**: `Raleway` - Para headings destacados

### Componentes de interfaz

- **Tarjetas de producto** con efectos hover suaves y sombras.
- **Skeleton loading** con animación shimmer (gradiente animado).
- **Botones** con estados hover, active, disabled y focus-visible.
- **Formularios** con validación en tiempo real y feedback visual.
- **Paginación** con indicadores de página actual y navegación.
- **Filtros** con dropdowns estilizados y sincronización desktop/mobile.
- **Modales** personalizados con overlay, animaciones y callbacks.
- **Badges** del carrito con contador de productos.
- **Tooltips** y estados de carga con spinners.
- **Radio buttons custom** con estilos personalizados.
- **Galería de imágenes** con thumbnails y navegación por flechas.

### Responsive design

#### Estrategia mobile first

- Diseño base optimizado para dispositivos móviles.
- Media queries con `max-width` para adaptabilidad.

#### Breakpoints principales

- **320px**: Móviles muy pequeños.
- **375px**: Móviles estándar.
- **480px**: Móviles grandes / Small phones landscape.
- **560px**: Phablets.
- **600px**: Tablets pequeñas.
- **768px**: Tablets / iPad portrait.
- **980px**: Tablets landscape / Desktop pequeño.
- **1024px**: Desktop estándar.
- **1200px**: Desktop grande (max-width contenedor).

#### Sistema de grid

- **Grid adaptativo**: `repeat(auto-fill, minmax(280px, 1fr))`.
- Se adapta automáticamente: 3 columnas → 2 columnas → 1 columna.
- Productos relacionados: `minmax(180px, 1fr)`.
- Grid usado en: productos, categorías, galería.

#### Tipografía escalable

- Variables CSS para todos los tamaños de fuente.
- Line-height adaptado según contexto (1.2 / 1.5 / 1.6).
- Ajustes específicos en breakpoints móviles.

### Accesibilidad

- **65+ ARIA labels** distribuidos en todo el sitio.
- **Semántica HTML5** correcta (header, nav, main, section, article, aside, footer, fieldset).
- **Focus-visible** para navegación por teclado.
- **Contraste de colores** cumple con WCAG AA.
- **Live regions** (`aria-live="polite"`) para actualizaciones dinámicas.
- **Labels descriptivos** en todos los controles interactivos.

### Sistema completo

Todas las variables están centralizadas en `variables.css` con:

- **94 variables CSS** organizadas por categorías.
- **Modo claro y oscuro** completos.
- **Fácil mantenimiento** y consistencia visual.
- **Reutilización** en todos los componentes.

## API consumida

La aplicación consume múltiples endpoints de la API oficial del curso e-Mercado:

**Base URL**: `https://japceibal.github.io/emercado-api/`.

### Endpoints utilizados

#### 1. Categorías

- **Endpoint**: `cats/cat.json`.
- **Uso**: Listar todas las categorías disponibles.
- **Datos**: `id`, `name`, `description`, `imgSrc`, `productCount`.

#### 2. Productos por categoría

- **Endpoint**: `cats_products/{categoryId}.json`.
- **Ejemplo**: `cats_products/101.json` (Autos).
- **Uso**: Obtener listado de productos de una categoría.
- **Datos por producto**:
  - `id` - Identificador único.
  - `name` - Nombre del producto.
  - `description` - Descripción detallada.
  - `cost` - Precio.
  - `currency` - Moneda (USD/UYU).
  - `image` - URL de imagen principal.
  - `soldCount` - Cantidad vendida.
- **Cache**: 5 minutos para optimizar performance.
- **Categoría por defecto**: Autos (ID: 101).

#### 3. Detalle de producto

- **Endpoint**: `products/{productId}.json`.
- **Ejemplo**: `products/50921.json`.
- **Uso**: Información completa de un producto específico.
- **Datos adicionales**:
  - `category` - Categoría del producto (objeto o string).
  - `images` - Array de múltiples imágenes.
  - `relatedProducts` - Array de productos relacionados (id, name, image).

#### 4. Comentarios de producto

- **Endpoint**: `products_comments/{productId}.json`.
- **Ejemplo**: `products_comments/50921.json`.
- **Uso**: Obtener calificaciones y opiniones de un producto.
- **Datos por comentario**:
  - `user` - Usuario que comentó.
  - `dateTime` - Fecha y hora del comentario.
  - `score` - Calificación (1-5 estrellas).
  - `description` - Texto del comentario.

#### 5. Carrito de usuario

- **Endpoint**: `user_cart/{userId}.json`.
- **Uso**: Obtener carrito guardado del usuario.
- **Datos**: Productos en el carrito con cantidades.

#### 6. Publicar producto

- **Endpoint**: `sell/publish.json`.
- **Uso**: Endpoint para publicar nuevos productos.

#### 7. Compra del carrito

- **Endpoint**: `cart/buy.json`.
- **Uso**: Procesar compra del carrito.

### Optimizaciones de API

- **Cache de 5 minutos**: Los productos por categoría se cachean en memoria (Map) para reducir llamadas.
- **Error handling robusto**: Try-catch en todas las llamadas con mensajes de error amigables.
- **Loading states**: Skeleton screens y spinners durante las peticiones.
- **Conversión de moneda**: Soporte para USD y UYU con tasa de cambio fija (1 USD = 40 UYU).

## Equipo

### Integrantes del Grupo

- **Agustina de los Santos** - [@agusdelossantos](https://github.com/agusdelossantos) - Diseñadora UX/UI y Documentación
- **Yenifer González** - [@yenifer-gonzalez](https://github.com/yenifer-gonzalez) - Desarrolladora Frontend
- **Marcos Betancor** - [@marcosbeta23](https://github.com/marcosbeta23) - Desarrollador JavaScript Principal
- **Hernán Baldi** - [@hernan-baldi](https://github.com/hernan-baldi) - Funcionalidades de Perfil y Gestión de Almacenamiento
- **Nahuel Regueira** - [@NRDEV1771](https://github.com/NRDEV1771) - Funcionalidades de Productos y Sistema de Calificaciones

### Organización del Trabajo

Tablero Trello: [[Link al tablero](https://trello.com/b/raegH2uJ/grupo-1-jap)]

## 📄Licencia

Este proyecto es parte del curso "Jóvenes a Programar" y está destinado a fines educativos.

## 🔗 Enlaces útiles

- [Documentación de la API](https://japceibal.github.io/emercado-api/)
- [Jóvenes a Programar](https://jovenesaprogramar.edu.uy/)
- [Bootstrap Documentation](https://getbootstrap.com/docs/)

---

_Para más detalles técnicos, consultar los archivos de código fuente en las carpetas `js/` y `css/`_
