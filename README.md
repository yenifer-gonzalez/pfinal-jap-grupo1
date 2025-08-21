# 🛍️ eMercado - Proyecto E-Commerce

Parte del proyecto de e-commerce desarrollado como parte del curso "Jóvenes a Programar". Implementa un sistema completo de autenticación, visualización de productos con filtros avanzados, paginación y gestión de sesiones, consumiendo APIs REST.

## ✨ Características Implementadas

- 🔐 **Sistema de Autenticación Avanzado**: Login con validaciones completas, gestión de sesiones y estados de carga
- 🛍️ **Catálogo de Productos Mejorado**: Visualización con filtros por precio, marca y modelo
- 📄 **Sistema de Paginación**: Navegación eficiente entre productos con renderizado optimizado
- 🎯 **Filtros Dinámicos**: Búsqueda y filtrado en tiempo real con debounce
- 🎨 **Diseño Responsive Premium**: Compatible con dispositivos móviles y desktop
- 🔒 **Protección de Rutas**: Verificación automática de sesiones activas con expiración
- 📱 **Interfaz Moderna**: Diseño con sistema de colores naranja (#FF8C00) y skeleton loading
- ⚡ **Optimización de Performance**: Cache de datos y renderizado modular

## 🚀 Cómo Usar

### 1. Acceso Inicial
- Abrir `index.html` en un navegador
- Hacer click en "Ingresar" para ir al login

### 2. Iniciar Sesión
- Completar campos Usuario y Contraseña 
- Click en "Ingresar" para acceder al sistema

### 3. Navegar Productos
- Click en categoría "Autos" desde la portada
- O navegar directamente a "Productos" desde el menú
- Los productos se cargan automáticamente desde la API con skeleton loading

### 4. Usar Filtros y Paginación
- **Filtros disponibles**: Precio, Marca, Modelo
- **Ordenamiento**: Por precio, nombre, cantidad vendida
- **Paginación**: 9 productos por página con navegación optimizada
- **Búsqueda en tiempo real** con debounce para mejor performance

### 5. Cerrar Sesión
- Click en el avatar de usuario en la esquina superior derecha
- Seleccionar "Cerrar sesión" del dropdown
- Sesión automática expira en 24 horas

## 📁 Estructura del Proyecto

```
workspace-inicial/
├── css/
│   ├── styles.css          # Estilos principales con sistema de diseño
│   ├── login.css          # Estilos específicos para login
│   └── variables.css      # Variables CSS del sistema de diseño
├── js/
│   ├── init.js            # Configuración global y gestión de sesiones
│   ├── login.js           # Lógica de autenticación avanzada
│   ├── products.js        # Consumo de API, filtros y paginación
│   └── index.js           # Navegación principal
├── img/                   # Imágenes del proyecto
├── login.html             # Página de inicio de sesión
├── products.html          # Página de listado de productos
└── index.html             # Página principal
```

## 🔧 Funcionalidades Técnicas

### Sistema de Autenticación Mejorado
- Validaciones en tiempo real con limpieza automática de errores
- Almacenamiento seguro en localStorage con expiración
- Verificación automática de sesión en páginas protegidas
- Redirección inteligente según estado de sesión

### Gestión Avanzada de Productos
- **API Consumption**: Fetch optimizado con cache de 5 minutos
- **Filtros Dinámicos**: Por precio, marca y modelo con debounce
- **Paginación Eficiente**: 9 productos por página con navegación suave
- **Skeleton Loading**: Estados de carga visual mientras cargan datos
- **Error Handling**: Manejo robusto de errores de red y API

### Optimización de Performance
- **Debounce**: En filtros para evitar llamadas excesivas
- **Cache Sistema**: Datos en memoria con expiración automática
- **Lazy Loading**: Imágenes optimizadas para mejor carga
- **Renderizado Modular**: Funciones reutilizables para mejor mantenimiento

## 🎨 Sistema de Diseño

### Paleta de Colores
- **Primario**: #FF8C00 (Naranja) 
- **Hover**: #E67E00 (Naranja oscuro)
- **Gradiente de fondo**: Beige claro → Durazno → Amarillo pálido
- **Texto**: Sistema jerárquico de grises
- **Sistema completo** definido en `variables.css`

### Componentes de Interfaz
- **Tarjetas de producto** con efectos hover suaves
- **Skeleton loading** con animación shimmer
- **Botones** con estados visuales claros
- **Formularios** con validación en tiempo real
- **Paginación** con indicadores visuales
- **Filtros** con dropdown estilizados

### Responsive Design
- **Mobile First**: Diseño optimizado para móviles
- **Breakpoints**: 768px (tablet) y 480px (móvil)
- **Grid adaptativo**: 3 columnas → 2 → 1 según dispositivo
- **Tipografía escalable**: Usando variables CSS

## 📊 API Consumida

La aplicación consume la API oficial del curso para obtener productos:
- **URL**: `https://japceibal.github.io/emercado-api/cats_products/101.json`
- **Categoría**: Autos (ID: 101)
- **Datos por producto**: id, name, description, cost, currency, image, soldCount
- **Cache**: 5 minutos para optimizar performance
- **Error Handling**: Reintentos automáticos y estados de error

## 🔒 Seguridad y Sesiones

### Gestión de Sesión
- **Almacenamiento**: localStorage con datos JSON estructurados
- **Expiración**: 24 horas automática con limpieza
- **Verificación**: En tiempo real en páginas protegidas
- **Redirección**: Automática según estado de autenticación

### Validaciones de Seguridad
- Verificación de sesión en tiempo real
- Limpieza automática de datos expirados
- Protección contra acceso no autorizado
- Redirección segura entre páginas

## 📱 Compatibilidad

### Navegadores Soportados
- ✅ Chrome/Chromium (Recomendado)
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ✅ Opera

### Dispositivos
- ✅ Desktop (1200px+)
- ✅ Laptop (992px - 1199px)
- ✅ Tablet (768px - 991px)
- ✅ Mobile (320px - 767px)

## 🚧 Estado del Proyecto

**ENTREGA 1 - COMPLETADA CON MEJORAS ✅**

### Requerimientos Obligatorios
- ✅ Pantalla de Login funcional
- ✅ Pantalla de Listado de Productos
- ✅ Consumo de API JSON (Categoría 101)
- ✅ Validaciones de formulario
- ✅ Sistema de gestión de sesiones

### Mejoras Implementadas
- ✅ Filtros avanzados por precio, marca y modelo
- ✅ Sistema de paginación 
- ✅ Skeleton loading states
- ✅ Optimización de performance con cache y debounce
- ✅ Diseño responsive 
- ✅ Arquitectura modular y mantenible

## 🛠️ Instalación y Desarrollo

### Requisitos
- Navegador web moderno
- Servidor web local (opcional, recomendado)

### Instalación
```bash
# Clonar el repositorio
git clone https://github.com/yenifer-gonzalez/workspace-inicial.git

# Navegar al directorio
cd workspace-inicial

# Abrir index.html en navegador
# O usar servidor local:
python -m http.server 8000
# Luego ir a http://localhost:8000
```

### Desarrollo
```bash
# Trabajar en ramas específicas
git checkout json-fetch    # Para funcionalidades de productos
git checkout login         # Para mejoras de autenticación
git checkout catalgo       # para mejoras de paginación de productos
git checkout sesion        # para mejoras de gestión de sesiones

# Hacer commits descriptivos
git commit -m "feat: añadir filtros avanzados de productos"
```

## 👥 Equipo

Proyecto desarrollado para "Jóvenes a Programar" - Plan Ceibal


## 📄 Licencia

Este proyecto es parte del curso "Jóvenes a Programar" y está destinado a fines educativos.

---

## 🔗 Enlaces Útiles

- [Documentación de la API](https://japceibal.github.io/emercado-api/)
- [Jóvenes a Programar](https://jovenesaprogramar.edu.uy/)
- [Bootstrap Documentation](https://getbootstrap.com/docs/)

---

*Para más detalles técnicos, consultar los archivos de código fuente en las carpetas `js/` y `css/`*
