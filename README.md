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

La aplicación cuenta con una **arquitectura full-stack** que separa frontend (HTML/CSS/JavaScript) y backend (Node.js + Express + MySQL/MariaDB), comunicándose mediante una **API REST segura con autenticación JWT**.

### Objetivo del proyecto

El desafío principal fue lograr que estas características se integraran en un único producto coherente. En el e-commerce, la **experiencia de usuario** es un aspecto clave: la solución debe funcionar de la forma más fluida posible, de lo contrario los clientes se marcharán.

Si bien la plataforma trata sobre compra y venta de bienes de cualquier tipo, nos concentramos únicamente en las funcionalidades de e-mercado **para los COMPRADORES**.

### Destacados

- **Arquitectura full-stack** con separación clara frontend/backend
- **API REST segura** con autenticación JWT y middleware de protección
- **Base de datos relacional** MariaDB con 11 tablas normalizadas
- **Experiencia de usuario optimizada** con diseño responsive mobile-first
- **Sistema de temas** claro/oscuro con persistencia
- **PWA ready** con Service Worker para modo offline
- **Optimizado para SEO y accesibilidad** (WCAG AA)
- **Performance optimizada** con lazy loading, caching y debouncing
- **Seguridad robusta** con bcrypt, JWT, validaciones y sanitización

---

## Características principales

### Autenticación y gestión de sesión

- **Sistema de login JWT** con validación de credenciales en MariaDB
- **Encriptación de contraseñas** con bcrypt (10 rounds)
- **Token JWT** con expiración automática (24 horas)
- **Middleware de autenticación** que protege rutas del backend
- **Almacenamiento seguro** del token en localStorage
- **Protección de rutas** frontend con redirección automática a login
- **Logout** con limpieza completa de datos y token
- **Toggle** de mostrar/ocultar contraseña en formularios

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
  - Foto de perfil con preview, conversión a base64 y **persistencia en localStorage**
  - Avatar sincronizado en header y sidebar
  - Sistema de tabs para organizar secciones
  - **Direcciones de envío**: CRUD completo con dirección predeterminada (localStorage)
  - **Tarjetas de pago**: Guardado seguro solo últimos 4 dígitos (localStorage)

- **Historial de pedidos**:

  - Listado completo de pedidos realizados **guardados en MariaDB**
  - Estados visuales: Pendiente, Confirmado, Enviado, Entregado
  - Detalles: fecha, total, método de pago, estado, productos
  - Relación con order_items para detalle completo
  - Filtrado y ordenamiento
  - **Única funcionalidad que persiste en base de datos**

- **Lista de favoritos/wishlist**:
  - Toggle de favoritos en tarjetas de productos con animación
  - Página dedicada con diseño horizontal compacto
  - **Persistencia en localStorage** para acceso rápido
  - Eliminación rápida y navegación directa a productos
  - Sincronización en tiempo real entre todas las vistas

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

### Backend

- **Node.js** - Runtime de JavaScript del lado del servidor
- **Express.js** - Framework web minimalista y rápido
- **MariaDB** - Base de datos relacional
- **JWT** - Autenticación basada en tokens
- **bcrypt.js** - Encriptación de contraseñas

### Almacenamiento y servicios

- **MariaDB Database** - Persistencia solo de órdenes finalizadas (orders + order_items)
- **LocalStorage** - Almacenamiento principal: perfil, direcciones, tarjetas, wishlist, carrito
- **Service Worker** - Caching de assets y funcionalidad offline

### Herramientas de desarrollo

- **Git & GitHub** - Control de versiones
- **nodemon** - Auto-restart del servidor en desarrollo
- **Prettier** - Formateo de código
- **Trello** - Gestión de proyecto
- **Font Awesome** - Iconografía

---

## Instalación y uso

### Requisitos previos

- **Node.js** v16 o superior
- **MySQL** o **MariaDB** instalado y corriendo
- Navegador web moderno (Chrome, Firefox, Safari, Edge)

### Instalación

1. **Clonar el repositorio**:

   ```bash
   git clone https://github.com/yenifer-gonzalez/pfinal-jap-grupo1
   cd pfinal-grupo1
   ```

2. **Configurar base de datos**:

   **Opción A: Usando MySQL desde terminal**

   ```bash
   mysql -u root -p < backend/db/ecommerce.sql
   ```

   **Opción B: Usando MariaDB/HeidiSQL (recomendado para Windows)**

   1. Abrir HeidiSQL
   2. Conectar a tu servidor MariaDB
   3. Ir a `Archivo` → `Ejecutar archivo SQL`
   4. Seleccionar `backend/db/ecommerce.sql`
   5. Ejecutar el script

   Esto creará la base de datos `ecommerce` con todas las tablas necesarias.

3. **Configurar variables de entorno**:

   ```bash
   cd backend
   cp .env.example .env
   # Editar .env con tus credenciales de MySQL/MariaDB
   ```

   Variables requeridas en `.env`:

   ```env
   DB_HOST=127.0.0.1
   DB_USER=root
   DB_PASSWORD=tu_password        # La contraseña de tu MariaDB/MySQL
   DB_NAME=ecommerce
   DB_PORT=3306                   # Puerto por defecto (3306 para MariaDB/MySQL)
   JWT_SECRET=tu_clave_secreta
   FRONTEND_URL=http://127.0.0.1:5500
   ```

4. **Instalar dependencias del backend**:

   ```bash
   npm install
   ```

5. **Iniciar el servidor backend**:

   ```bash
   # Modo desarrollo (con nodemon)
   npm run dev

   # Modo producción
   npm start
   ```

   El servidor estará disponible en `http://localhost:3000`

6. **Abrir el frontend**:

   - Opción 1: Usar Live Server en VS Code (recomendado)
   - Opción 2: Usar servidor local:

     ```bash
     # Desde la carpeta frontend
     cd ../frontend
     npx http-server -p 5500
     ```

   - Navegar a `http://127.0.0.1:5500/login.html`

7. **Crear usuario de prueba**:

   Para poder iniciar sesión, primero debes crear un usuario en la base de datos:

   **Opción A: Usando terminal MySQL/MariaDB**

   ```bash
   # Abrir MySQL/MariaDB
   mysql -u root -p

   # Seleccionar la base de datos
   USE ecommerce;

   # Insertar usuario de prueba
   INSERT INTO users (username, email, password, role, first_name, last_name)
   VALUES (
     'test@example.com',
     'test@example.com',
     '$2a$10$xQ7Z8vK9L6M2pN4oP5rQ6.eJYfH8wX9vT0sU1bR3cV4dW5eX6fY7g',
     'user',
     'Usuario',
     'Prueba'
   );
   ```

   **Opción B: Usando HeidiSQL (recomendado para Windows)**

   1. Abrir HeidiSQL y conectar a tu servidor
   2. Seleccionar la base de datos `ecommerce` en el panel izquierdo
   3. Ir a la pestaña `Consulta` (o presionar F9)
   4. Copiar y pegar el siguiente SQL:

   ```sql
   INSERT INTO users (username, email, password, role, first_name, last_name)
   VALUES (
     'test@example.com',
     'test@example.com',
     '$2a$10$xQ7Z8vK9L6M2pN4oP5rQ6.eJYfH8wX9vT0sU1bR3cV4dW5eX6fY7g',
     'user',
     'Usuario',
     'Prueba'
   );
   ```

   5. Presionar F9 o hacer clic en el botón ▶️ (Ejecutar)

   **IMPORTANTE: El script SQL ya incluye usuarios de prueba**

   Al ejecutar `ecommerce.sql`, se crean automáticamente 2 usuarios listos para usar:

   **Usuario normal:**

   - Email: `test@ecommerce.com`
   - Contraseña: `test123`
   - Rol: `user`

   **Usuario administrador:**

   - Email: `admin@ecommerce.com`
   - Contraseña: `test123`
   - Rol: `admin`

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
├── backend/
│   ├── config/
│   │   ├── database.js          # Configuración MySQL con pool
│   │   └── jwt.js               # Configuración JWT
│   │
│   ├── controllers/
│   │   ├── authController.js    # Login y autenticación
│   │   ├── categoriesController.js
│   │   ├── productsController.js
│   │   ├── profileController.js
│   │   ├── ordersController.js
│   │   └── wishlistController.js
│   │
│   ├── data/                    # Archivos JSON (datos estáticos)
│   │   ├── cats/                # Categorías
│   │   ├── cats_products/       # Productos por categoría
│   │   ├── products/            # Detalles de productos
│   │   └── products_comments/   # Comentarios
│   │
│   ├── db/
│   │   └── ecommerce.sql        # Script de creación de BD
│   │
│   ├── middleware/
│   │   ├── auth.js              # Middleware de autenticación JWT
│   │   └── errorHandler.js     # Manejo global de errores
│   │
│   ├── models/
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Category.js
│   │   ├── Order.js
│   │   ├── Address.js
│   │   ├── PaymentCard.js
│   │   └── Wishlist.js
│   │
│   ├── routes/
│   │   ├── index.js             # Router principal
│   │   ├── auth.js
│   │   ├── categories.js
│   │   ├── products.js
│   │   ├── cart.js
│   │   ├── profile.js
│   │   ├── wishlist.js
│   │   └── orders.js
│   │
│   ├── .env.example             # Variables de entorno de ejemplo
│   ├── package.json
│   └── server.js                # Punto de entrada del servidor
│
├── frontend/
│   ├── css/
│   │   ├── bootstrap.min.css    # Framework CSS
│   │   ├── cart.css             # Carrito de compras
│   │   ├── categories.css       # Categorías
│   │   ├── checkout.css         # Checkout y métodos de pago
│   │   ├── home.css             # Página principal
│   │   ├── login.css            # Login
│   │   ├── my-profile.css       # Perfil, pedidos y favoritos
│   │   ├── order-confirmation.css
│   │   ├── styles.css           # Estilos globales
│   │   └── variables.css        # Variables del sistema de diseño
│   │
│   ├── js/
│   │   ├── api.js               # Funciones de API con JWT
│   │   ├── cart.js              # Lógica del carrito
│   │   ├── categories.js        # Navegación de categorías
│   │   ├── checkout.js          # Sistema de checkout
│   │   ├── index.js             # Página principal
│   │   ├── init.js              # Configuración global y sesiones
│   │   ├── login.js             # Autenticación
│   │   ├── my-profile.js        # Perfil, pedidos y favoritos
│   │   ├── order-confirmation.js
│   │   ├── product-info.js      # Detalle de producto
│   │   └── products.js          # Listado, filtros y paginación
│   │
│   ├── img/                     # Imágenes del proyecto
│   ├── webfonts/                # Fuentes web
│   │
│   ├── cart.html
│   ├── categories.html
│   ├── checkout.html
│   ├── index.html
│   ├── login.html
│   ├── my-profile.html
│   ├── order-confirmation.html
│   ├── product-info.html
│   ├── products.html
│   └── sw.js                    # Service Worker
│
└── README.md                    # Este archivo
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

La aplicación usa una API REST propia desarrollada con Node.js + Express:

**Base URL**: `http://localhost:3000/api`

<details>
<summary>Ver endpoints disponibles</summary>

#### Autenticación (Públicos)

- `POST /auth/login` - Iniciar sesión
  - Body: `{ username, password }`
  - Response: `{ token, user }`

#### Health Check (Público)

- `GET /health` - Verificar estado del servidor

#### Categorías (Protegido - Requiere JWT)

- `GET /categories` - Listado de todas las categorías

#### Productos (Protegido - Requiere JWT)

- `GET /products/:categoryId` - Productos por categoría
- `GET /products/detail/:productId` - Detalle de un producto
- `GET /products/comments/:productId` - Comentarios de un producto
- `GET /products/related/:productId` - Productos relacionados
- `GET /products/search?q=term` - Búsqueda de productos

#### Perfil (Protegido - Requiere JWT)

- `GET /profile` - Obtener datos del usuario
- `PUT /profile` - Actualizar datos del usuario
- `GET /profile/addresses` - Listar direcciones de envío
- `POST /profile/addresses` - Crear dirección de envío
- `PUT /profile/addresses/:id` - Actualizar dirección
- `DELETE /profile/addresses/:id` - Eliminar dirección
- `GET /profile/cards` - Listar tarjetas guardadas
- `POST /profile/cards` - Crear tarjeta de pago
- `PUT /profile/cards/:id` - Actualizar tarjeta
- `DELETE /profile/cards/:id` - Eliminar tarjeta

#### Órdenes (Protegido - Requiere JWT)

- `GET /orders` - Listar órdenes del usuario
- `POST /orders` - Crear nueva orden
  - Body: `{ items, subtotal, shipping, total, paymentMethod, address }`
- `GET /orders/:orderId` - Detalle de una orden

#### Carrito (Alias de órdenes - Protegido)

- `POST /cart` - Crear orden (redirige a POST /orders)

</details>

**Autenticación**:

- Todas las rutas protegidas requieren header: `Authorization: Bearer <token>`
- Token JWT válido por 24 horas
- Si el token expira o es inválido, responde con `401 Unauthorized`

**Optimizaciones**:

- Pool de conexiones MySQL/MariaDB (máximo 10 conexiones)
- Cache de 5 minutos en productos por categoría (frontend)
- Error handling con try-catch en todas las llamadas
- Loading states con skeleton screens
- Middleware global de manejo de errores

### Arquitectura de base de datos

La aplicación utiliza MariaDB con un esquema relacional normalizado de **11 tablas**:

<details>
<summary>Ver estructura de la base de datos</summary>

#### Tablas principales

1. **users** - Usuarios del sistema **UTILIZADA PARA AUTENTICACIÓN**

   - Campos: id, username, email, password (hash bcrypt), role, first_name, last_name, phone, profile_photo
   - **Uso actual:** Validación de credenciales en login (POST /auth/login) con JWT
   - **Nota:** Los datos de perfil extendidos (nombre, apellido, teléfono, foto) se gestionan en localStorage por decisión de arquitectura

2. **categories** - Categorías de productos

   - Campos: id, name, description, img_src
   - 9 categorías: Autos, Juguetes, Muebles, Herramientas, Computadoras, Vestimenta, Electrodomésticos, Deporte, Celulares

3. **products** - Catálogo de productos

   - Campos: id, category_id (FK), name, description, cost, currency, sold_count
   - Relaciones: Pertenece a categoría, tiene imágenes, comentarios, relacionados

4. **product_images** - Imágenes de productos

   - Campos: id, product_id (FK), image_url, is_primary, display_order
   - Permite múltiples imágenes por producto con orden

5. **product_comments** - Comentarios y calificaciones

   - Campos: id, product_id (FK), user_id (FK), score (1-5), description, created_at
   - Constraint: UNIQUE (product_id, user_id) - un comentario por usuario

6. **related_products** - Productos relacionados

   - Campos: id, product_id (FK), related_product_id (FK)
   - Relación many-to-many entre productos

7. **orders** - Órdenes de compra **ÚNICA TABLA UTILIZADA**

   - Campos: id, user_id (FK), subtotal, discount, coupon_code, shipping_cost, shipping_type, total, payment_method, crypto_currency, shipping_address, status, created_at
   - Estados: pending, confirmed, shipped, delivered
   - **Persistencia:** Se guarda cada orden finalizada en checkout

8. **order_items** - Items de cada orden **ÚNICA TABLA UTILIZADA**

   - Campos: id, order_id (FK), product_id (FK), quantity, unit_price, currency
   - Relación many-to-many entre orders y products
   - **Persistencia:** Se guardan los productos de cada orden

9. **addresses** - Direcciones de envío (tabla disponible pero no utilizada)

   - Campos: id, user_id (FK), alias, street, corner, apartment, city, state, zip_code, country, phone, is_default
   - **Nota:** Las direcciones se gestionan en localStorage. La tabla existe para futura implementación.

10. **payment_cards** - Tarjetas de pago guardadas (tabla disponible pero no utilizada)

    - Campos: id, user_id (FK), last_four, card_name, expiry, is_default
    - **Nota:** Las tarjetas se gestionan en localStorage. La tabla existe para futura implementación.

11. **wishlists** - Lista de deseos (tabla disponible pero no utilizada)
    - Campos: id, user_id (FK), product_id (FK), created_at
    - **Nota:** La wishlist se gestiona en localStorage. La tabla existe para futura implementación.

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

- [Node.js Documentation](https://nodejs.org/docs/)
- [Express.js Guide](https://expressjs.com/es/guide/routing.html)
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [MariaDB Documentation](https://mariadb.com/kb/en/documentation/)
- [HeidiSQL Documentation](https://www.heidisql.com/help.php)
- [JWT.io](https://jwt.io/)
- [Bootstrap 5 Docs](https://getbootstrap.com/docs/)
- [MDN Web Docs](https://developer.mozilla.org/)

### Programa

- [Jóvenes a Programar](https://jovenesaprogramar.edu.uy/)
- [Plan Ceibal](https://www.ceibal.edu.uy/)

### Herramientas

- [Git & GitHub](https://github.com/)
- [Trello](https://trello.com/)
- [Prettier](https://prettier.io/)
- [nodemon](https://nodemon.io/)

---

## Licencia

Este proyecto es parte del curso Jóvenes a Programar y está destinado a fines educativos.

---

**Proyecto Final - Desarrollo Web | Jóvenes a Programar 2025**

_Para más detalles técnicos, consultar los archivos de código fuente en las carpetas `js/` y `css/`_
