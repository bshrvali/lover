# Lover

Romantik “Mənimlə sevgili olarsan?” tətbiqi.

## Link

Adı UTF-8 Base64 ilə encode edib URL path-ə əlavə et:

```text
https://YOUR_DOMAIN/<base64(ad)>
```

Nümunə (`Səbinə` → `U8mZYmluyZk=`):

```text
https://YOUR_DOMAIN/U8mZYmluyZk%3D
```

Ana səhifədə ad yazıb link də yarada bilərsən.

## Əməliyyat

- **Hə** — qəbul mesajı
- **Yox** — desktop-da mousedan qaçır; telefondə klik/toxunuşda cəld yer dəyişir
- Arxa planda IP + latitude/longitude (IP geolocation) gizli toplanır

## Vizual ziyarətlər

```text
GET /api/visits?key=lover-secret
```

`VISITS_SECRET` env ilə dəyişmək olar.

## Lokal işə salma

```bash
npm install
npm run dev
```

## Deploy

Vercel-ə bağla və deploy et. Root: bu repo.
