# Altamar — Guía de despliegue (Vercel + Neon + Cloudinary)

Pasos para poner el sitio en producción. Todo se hace desde los paneles de
cada servicio; no se suben credenciales al repositorio.

## 1. Neon (base de datos)

1. En https://neon.tech crea un proyecto (región cercana: `us-east-1`).
2. Usa la rama `main` para **producción** y crea otra rama (`dev`) para
   pruebas locales y E2E. Nunca corras `pnpm seed` ni `pnpm e2e` contra
   producción.
3. Copia la *connection string* (con `?sslmode=require`) de la rama de
   producción.
4. Desde tu máquina, con esa cadena en `DATABASE_URL`:

   ```bash
   pnpm db:migrate
   pnpm admin:create correo-del-dueno@ejemplo.com "una-contraseña-larga-y-única"
   ```

## 2. Cloudinary (imágenes)

1. Usa la misma cuenta o una nueva para producción.
2. Configura `CLOUDINARY_UPLOAD_FOLDER=altamar/prod` para no mezclar con
   las imágenes de desarrollo (`altamar/dev`).
3. Ver `docs/CLOUDINARY_SETUP.md` para obtener cloud name, API key y secret.

## 3. Vercel (aplicación)

1. Importa el repositorio de GitHub en https://vercel.com/new. Vercel detecta
   Next.js y pnpm automáticamente.
2. En *Settings → Environment Variables* (entorno **Production**) agrega:

   | Variable | Valor |
   |---|---|
   | `NEXT_PUBLIC_SITE_URL` | `https://tu-dominio.com` (sin `/` final) |
   | `DATABASE_URL` | cadena de la rama de producción de Neon |
   | `AUTH_SECRET` | 32+ caracteres aleatorios (ver `.env.example`) |
   | `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | cloud name |
   | `CLOUDINARY_API_KEY` | API key |
   | `CLOUDINARY_API_SECRET` | API secret |
   | `CLOUDINARY_UPLOAD_FOLDER` | `altamar/prod` |
   | `NEXT_PUBLIC_WHATSAPP_NUMBER` | número real, solo dígitos con código de país (ej. `18095551234`) |
   | `NEXT_PUBLIC_CONTACT_PHONE` | teléfono real |
   | `NEXT_PUBLIC_CONTACT_EMAIL` | correo real |
   | `NEXT_PUBLIC_INSTAGRAM_URL` | URL de Instagram (opcional) |

   Las variables `NEXT_PUBLIC_*` se incrustan al compilar: si cambias una,
   vuelve a desplegar.
3. Despliega. En *Settings → Domains* conecta el dominio y actualiza
   `NEXT_PUBLIC_SITE_URL` si cambió.

## 4. Verificación después del despliegue

- [ ] `/` y `/en-venta` cargan sin errores.
- [ ] `/admin` redirige a `/admin/login`; el login del dueño funciona.
- [ ] Crear un borrador, subir 2 imágenes, publicarlo y verlo en `/en-venta`.
- [ ] El botón de WhatsApp abre el chat con el número real y el enlace del producto.
- [ ] `/sitemap.xml` y `/robots.txt` usan el dominio real.
- [ ] Despublicar o borrar el producto de prueba.

## 5. Mantenimiento

- Si Cloudinary falló al borrar alguna imagen, queda en `media_cleanup_queue`.
  Ejecútalo de vez en cuando con la `DATABASE_URL` de producción:

  ```bash
  pnpm media:cleanup
  ```

- Tras 5 intentos fallidos de login con el mismo correo (o 20 desde la misma
  IP) el acceso se bloquea 15 minutos.
- Antes de aplicar una migración nueva en producción, pruébala en la rama
  `dev` de Neon.
