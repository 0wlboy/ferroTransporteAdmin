<div align="center">

# 🚍 FerroTransporte Admin

**Plataforma Integral de Administración, Gestión de Flotas y Monitoreo de Transporte**

[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Auth-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

</div>

---

## ‼️ AVISO / DISCLAIMER

> Este panel administrativo está diseñado exclusivamente para la gestión y monitoreo del sistema de transporte de **FerroTransporte / BusTracker**. Ningún fork no autorizado de este proyecto recibirá soporte oficial; si utiliza un fork, diríjase a su mantenedor.

---

## 📖 Descripción del Proyecto

**FerroTransporte Admin** es un panel de control web moderno, rápido y reactivo desarrollado con **React 19**, **Vite** y **Tailwind CSS**, respaldado por **Supabase** para la persistencia de datos en tiempo real y autenticación segura. Permite a los administradores supervisar la flota de vehículos, asignar conductores, gestionar pasajeros, monitorear peticiones de transporte, visualizar rutas/paradas en mapas interactivos y generar reportes ejecutivos en PDF y Excel.

---

## ✨ Características Principales

### 📊 Dashboard & Métricas en Tiempo Real
- **KPIs Clave:** Visualización inmediata del total de pasajeros, conductores, unidades activas y solicitudes pendientes.
- **Gráficas Interactivas:** Análisis visual de tendencias de viajes y actividad mediante **Recharts**.
- **Monitoreo Continuo:** Actualizaciones en vivo de los datos operativos más relevantes del sistema.

### 👥 Gestión Integral de Usuarios y Pasajeros
- **Directorio de Pasajeros:** Consulta, registro, actualización y suspensión de usuarios.
- **Historial de Actividad:** Registro detallado de viajes solicitados, cancelaciones y comportamiento de cada usuario.
- **Búsqueda y Filtros:** Búsqueda rápida por nombre, correo, cédula o estado.

### 🚗 Administración de Flota y Conductores
- **Control de Vehículos:** Registro de unidades, placas, capacidades, modelos y estado operativo.
- **Gestión de Choferes:** Asignación de vehículos a conductores autorizados y control de turnos.
- **Actividad de Unidades:** Historial de trayectos, rendimiento y estado de mantenimiento de cada vehículo.

### 🗺️ Geolocalización y Puntos de Interés
- **Mapas Interactivos:** Integración con **Leaflet** y **React-Leaflet** para visualización espacial.
- **Gestión de Paradas:** Alta, edición y georreferenciación de paradas y terminales de transporte.
- **Marcadores Dinámicos:** Ubicación visual clara con información detallada de cada punto en el mapa.

### 📝 Control de Peticiones y Solicitudes
- **Bandeja de Solicitudes:** Seguimiento en tiempo real de peticiones de viaje emitidas por los usuarios.
- **Gestión de Estados:** Aprobación, asignación, rechazo y finalización de viajes.
- **Trazabilidad:** Monitoreo del ciclo de vida de cada solicitud.

### 📑 Motor de Reportes y Exportación
- **Exportación a PDF:** Generación instantánea de reportes ejecutivos con formato profesional vía **jsPDF** y **jspdf-autotable**.
- **Exportación a Excel:** Descarga de tablas de datos completas a hojas de cálculo `.xlsx` vía **SheetJS (xlsx)**.
- **Filtros Personalizables:** Exportación segmentada por fechas, estados o categorías.

### 🔐 Seguridad y Autenticación
- **Supabase Auth:** Autenticación robusta con manejo de sesiones persistentes y tokens seguros.
- **Recuperación de Contraseña:** Flujo completo de recuperación y restablecimiento vía correo electrónico.
- **Rutas Protegidas:** Control estricto de acceso a vistas administrativas mediante `AuthContext`.

### 🎨 UI/UX Moderna y Eficiente
- **Diseño Responsivo:** Adaptabilidad total a pantallas de escritorio, tablets y móviles.
- **Iconografía Consistente:** Integración de **Lucide React** para una experiencia visual limpia y profesional.
- **Code-Splitting:** Carga diferida de componentes y páginas con `React.lazy` y `Suspense` para máxima velocidad.

---

## 🛠️ Stack Tecnológico

| Categoría | Tecnología | Propósito |
| :--- | :--- | :--- |
| **Framework Base** | [React 19](https://react.dev/) | Construcción de interfaz de usuario basada en componentes |
| **Build Tool & Bundler** | [Vite 8](https://vitejs.dev/) | Entorno de desarrollo ultrarrápido y empaquetado optimizado |
| **Estilos & Diseño** | [Tailwind CSS v4](https://tailwindcss.com/) | Sistema de utilidades CSS moderno y altamente personalizable |
| **Base de Datos & Auth** | [Supabase](https://supabase.com/) | PostgreSQL en la nube, autenticación y base de datos en tiempo real |
| **Enrutamiento** | [React Router v7](https://reactrouter.com/) | Enrutamiento declarativo y protección de vistas |
| **Mapas & Geodatos** | [React-Leaflet](https://react-leaflet.js.org/) / [Leaflet](https://leafletjs.com/) | Renderizado y manipulación de mapas interactivos |
| **Gráficas & Analítica** | [Recharts](https://recharts.org/) | Visualización interactiva de estadísticas y métricas |
| **Reportes PDF** | [jsPDF](https://github.com/parallax/jsPDF) + [AutoTable](https://github.com/simonbengtsson/jsPDF-AutoTable) | Creación y formato de documentos PDF dinámicos |
| **Reportes Excel** | [XLSX (SheetJS)](https://sheetjs.com/) | Exportación de datos tabulares a hojas de cálculo `.xlsx` |
| **Iconos** | [Lucide React](https://lucide.dev/) | Paquete de iconografía vectorial moderno y ligero |

---

## 📱 Requisitos Previos

- **Node.js**: Versión 18.0.0 o superior (se recomienda Node 20 LTS).
- **Gestor de Paquetes**: `npm` (v9+), `pnpm` o `yarn`.
- **Navegador Moderno**: Google Chrome, Mozilla Firefox, Microsoft Edge o Safari compatible con ES Modules.
- **Cuenta de Supabase**: Proyecto activo con las tablas y esquemas correspondientes.

---

## 🚀 Guía de Instalación y Uso

### 1. Clonar el Repositorio
```bash
git clone https://github.com/tu-usuario/ferroTransporteAdmin.git
cd ferroTransporteAdmin
```

### 2. Instalar Dependencias
```bash
npm install
```

### 3. Configurar Conexión con Supabase
Verifique que los parámetros de conexión en [utils/supabase.js](file:///utils/supabase.js) apunten a su instancia de Supabase:
```javascript
export const supabaseUrl = 'https://tu-proyecto.supabase.co';
export const supabaseAnonKey = 'tu-anon-key';
```

### 4. Iniciar el Servidor de Desarrollo
```bash
npm run dev
```
La aplicación estará disponible de forma local en `http://localhost:5173`.

### 5. Compilar para Producción
```bash
npm run build
```
Los archivos estáticos optimizados se generarán en la carpeta `dist/`.

### 6. Vista Previa del Bundle de Producción
```bash
npm run preview
```

---

## 📂 Estructura del Proyecto

```text
ferroTransporteAdmin/
├── public/                 # Recursos estáticos públicos (logos, favicons, etc.)
├── src/
│   ├── assets/             # Imágenes, iconos y recursos multimedia internos
│   ├── components/         # Componentes UI reutilizables
│   │   ├── UI/             # Elementos base de interfaz (botones, badges, loaders)
│   │   ├── cards/          # Tarjetas de datos y métricas
│   │   ├── forms/          # Formularios reutilizables
│   │   ├── inputs/         # Componentes de entrada y controles de texto
│   │   ├── modals/         # Modales de confirmación y formularios emergentes
│   │   └── Layout.jsx      # Layout maestro (Sidebar, Navbar, contenedor principal)
│   ├── context/            # Proveedores de estado global (AuthContext)
│   ├── css/                # Estilos globales y reglas personalizadas
│   ├── hooks/              # Hooks personalizados de React
│   ├── pages/              # Vistas de la aplicación
│   │   ├── auth/           # Vistas protegidas (Panel administrativo)
│   │   │   ├── add/        # Formularios de creación (Autos, Usuarios, Paradas)
│   │   │   ├── update/     # Formularios de edición y actualización
│   │   │   └── view/       # Vistas de listado, métricas y actividades
│   │   └── public/         # Vistas públicas (Login, Registro, Recuperación)
│   ├── App.jsx             # Definición de rutas, Code-Splitting y Suspense
│   ├── App.css             # Estilos raíz
│   └── main.jsx            # Punto de entrada de la aplicación React
├── utils/                  # Funciones de utilidad y configuración externa
│   ├── excelExport.js      # Utilidades de exportación a archivos Excel (.xlsx)
│   ├── pdfExport.js        # Utilidades de generación de reportes en PDF
│   └── supabase.js         # Cliente y configuración de Supabase
├── eslint.config.js        # Configuración de linter ESLint
├── index.html              # Plantilla HTML principal
├── package.json            # Dependencias y scripts del proyecto
└── vite.config.js          # Configuración de compilación de Vite
```

---

## 🤝 Contribución

¡Las contribuciones son bienvenidas! Para colaborar en este proyecto:

1. Realice un **Fork** del repositorio.
2. Cree una rama para su funcionalidad (`git checkout -b feature/NuevaCaracteristica`).
3. Confirme sus cambios con mensajes descriptivos (`git commit -m 'feat: Agrega nueva característica'`).
4. Envíe sus cambios a su repositorio remoto (`git push origin feature/NuevaCaracteristica`).
5. Abra un **Pull Request** detallando las mejoras realizadas.

---

## 📄 Licencia

Este proyecto está distribuido bajo la Licencia **MIT**. Consulte el archivo `LICENSE` para obtener más información.

<div align="center">
  <sub>Desarrollado con ❤️ para la modernización de la gestión del transporte de pasajeros.</sub>
</div>
