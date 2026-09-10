# Cloudinary Setup

Image upload is fully implemented and tested (signing, upload, server-side
verification, DB persistence) but **cannot complete a real upload** until
`.env.local` has a real Cloudinary account's credentials — it currently has
placeholder values, which Cloudinary correctly rejects with
`Unknown API key placeholder` (confirmed live; see
`docs/IMPLEMENTATION_STATE.md`).

## Steps

1. Create a free account at https://cloudinary.com/users/register/free (or
   use an existing one).
2. From the Cloudinary console **Dashboard**, copy:
   - **Cloud name**
   - **API Key**
   - **API Secret** (click "reveal")
3. Edit `.env.local` in the project root and replace the placeholder values:

   ```
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=<your cloud name>
   CLOUDINARY_API_KEY=<your api key>
   CLOUDINARY_API_SECRET=<your api secret>
   CLOUDINARY_UPLOAD_FOLDER=altamar/dev
   ```

   No quotes, no trailing whitespace, no `NEXT_PUBLIC_` prefix on the key or
   secret (only the cloud name is public).

4. **Restart the dev server** (`pnpm dev`) — Next.js only reads
   `.env.local` at process start.
5. Verify the fix works:

   ```bash
   pnpm seed          # if you haven't already
   pnpm seed:media    # uploads dev-assets/reference-products/ to the real account
   ```

   You should see `✓ ... -> position 0` lines and a final `Uploaded: N,
   skipped: 0, failed: 0`. If you instead see `Cloudinary upload failed:
   Unknown API key ...` or `Invalid Signature`, double-check step 3 (a
   common mistake is copying the API secret with a trailing space, or
   mixing up two different Cloudinary accounts' key/secret).

6. Open `/admin/productos/<any-product>` and confirm the "Imágenes" section
   shows the uploaded photos, and that `/en-venta` and the product's public
   detail page render them.

## What's already correct and doesn't need touching

- Direct signed browser upload (the API secret never reaches the client).
- Server-side re-verification of the real Cloudinary-reported
  format/size/dimensions before any DB write.
- Atomic image reorder (Postgres RPC) and cover-image selection
  (`position = 0`).
- Folder convention: `altamar/dev/products/<product-id>` (centralized in
  `src/lib/cloudinary/folder.ts`).

## Production later

Repeat the same steps with a **separate** Cloudinary account (or the same
account's production API key if you prefer one account with folder
separation) and `CLOUDINARY_UPLOAD_FOLDER=altamar/prod` in the production
environment's variables — never in a file committed to git.
