# EDV OS — Sistema Cognitivo Multiagente

Versión independiente para VS Code. La interfaz fue rediseñada con una dirección visual oscura, editorial y de alto contraste: navegación compacta, paneles translúcidos, tipografía técnica, acentos verde eléctrico y una sensación de "command center" inspirada en la referencia visual indicada por el proyecto.

## 1. Requisitos locales
- Node.js 22 LTS o superior recomendado.
- pnpm 10 (`corepack enable` y luego `corepack prepare pnpm@10 --activate`, si corresponde).
- MySQL 8 o un proveedor MySQL compatible.
- VS Code y extensiones recomendadas: ESLint, Prettier, Tailwind CSS IntelliSense.

## 2. Arranque rápido
```bash
pnpm install
cp .env.example .env
pnpm db:push
pnpm dev
```
Abrir la URL que muestra la terminal, normalmente `http://localhost:3000`.

## 3. Variables de entorno
```env
DATABASE_URL=mysql://USER:PASSWORD@HOST:3306/DB
JWT_SECRET=una-clave-larga-y-aleatoria
LLM_BASE_URL=https://api.openai.com/v1
LLM_API_KEY=
LLM_MODEL=
CRON_SECRET=
SERVICE_API_URL=
SERVICE_API_KEY=
```
Nunca subir `.env` a Git.

## 4. Qué necesitan los agentes para funcionar
EDV no requiere Manus. Los agentes están implementados como lógica del servidor y se alimentan de la base de datos y, para razonamiento generativo, de un proveedor LLM compatible con la API de OpenAI.

### Mínimo para probar agentes
1. Configurar `DATABASE_URL`.
2. Ejecutar `pnpm db:push`.
3. Cargar/crear clientes, reglas del ADN organizacional y agentes desde el sistema o mediante las tablas correspondientes.
4. Configurar `LLM_API_KEY` y `LLM_MODEL` si se quiere razonamiento con IA.
5. Ejecutar tareas desde el panel de órganos/agentes.

Sin LLM, las partes determinísticas y el flujo de datos pueden funcionar, pero las tareas que invoquen razonamiento generativo requerirán un proveedor configurado.

## 5. Proveedores externos
### Base de datos
Usar MySQL local, Docker, Railway, Aiven, DigitalOcean u otro proveedor compatible. La URL debe ir en `DATABASE_URL`.

### LLM / IA
El proyecto usa una interfaz compatible con OpenAI. Configurar:
- `LLM_BASE_URL`
- `LLM_API_KEY`
- `LLM_MODEL`

Puede apuntarse a OpenAI u otro endpoint compatible. Elegir un modelo que soporte las capacidades que utilicen los agentes.

### Open Banking
El módulo necesita un proveedor real para producción. Deben contratarse/registrarse las credenciales del proveedor elegido y adaptar el flujo de autorización a su API. No usar credenciales de producción en el frontend.

### ARCA / servicios fiscales
Para producción se requieren las credenciales, certificados, autorización y endpoints correspondientes al servicio oficial que se integre. La existencia de una pantalla o agente no implica homologación automática.

### Almacenamiento de archivos
Para producción configurar un servicio S3 compatible y las credenciales correspondientes en el backend. Verificar permisos de lectura/escritura y URLs firmadas.

### Tareas programadas
Proteger `/api/scheduled/productionHealth` con `CRON_SECRET` y configurar un scheduler externo (GitHub Actions, cron del hosting o proveedor equivalente) que invoque el endpoint de forma autenticada.

## 6. Autenticación
La versión local utiliza autenticación independiente del runtime de Manus. Antes de producción se recomienda integrar un proveedor de identidad real, HTTPS, cookies seguras, rotación de secretos y control de roles.

## 7. Validación antes de desplegar
```bash
pnpm check
pnpm test
pnpm build
NODE_ENV=production pnpm start
```

## 8. Producción
Configurar las mismas variables de entorno en el hosting, una base de datos persistente, migraciones, almacenamiento, proveedor LLM, secretos, HTTPS y monitoreo. Ejecutar una prueba completa de cada integración externa antes de habilitar datos reales.
