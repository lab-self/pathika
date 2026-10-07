# Image sources and asset notes

All seven travel images were generated specifically for this project with OpenAI image generation on 2026-10-07, then stored locally. They are original, photorealistic-style illustrations, not documentary photographs or third-party stock assets. No external image URLs or third-party image licenses are involved. Under the [OpenAI Terms of Use](https://openai.com/policies/terms-of-use/), users own generated output as between them and OpenAI, to the extent permitted by law; output may not be unique.

| Asset | Description | Source | Usage |
|---|---|---|---|
| `assets/images/kashmir-lake.jpg` | Kashmir lake and Himalayan peaks at sunset | OpenAI image generation | Home, domestic and destination cards |
| `assets/images/rajasthan-jaipur.jpg` | Jaipur heritage rooftops at golden hour | OpenAI image generation | Home, domestic, about and category cards |
| `assets/images/kerala-backwaters.jpg` | Kerala houseboat on a palm-lined backwater at sunrise | OpenAI image generation | Home, domestic, about and category cards |
| `assets/images/maldives-lagoon.jpg` | Maldives lagoon and overwater villas | OpenAI image generation | Home, international and category cards |
| `assets/images/dubai-creek.jpg` | Dubai skyline and creek at dusk | OpenAI image generation | Home, international and contact hero |
| `assets/images/bali-temple.jpg` | Balinese temple gate and tropical valley at sunrise | OpenAI image generation | International and category cards |
| `assets/images/swiss-alps.jpg` | Swiss alpine village, lake and mountain peaks | OpenAI image generation | International destination cards |

The generated PNG masters were converted locally to JPEG at quality 82; 480px and 768px responsive variants are included beside each 1536px master. The supplied logo remains unchanged at `assets/icons/pathika-logo.png`.

## Separate Home, Domestic and International image sets

Eight more destination images were generated for this update on 2026-10-07, then locally resized to 1600px, 768px and 480px JPEG variants at quality 84. These new page-specific images are not shared across Home, Domestic, or International. They are AI-generated photorealistic-style images, not documentary photographs.

| Asset family (`.jpg`; `-768.jpg` and `-480.jpg` responsive variants) | Description | Source | Usage |
|---|---|---|---|
| `assets/images/home/pathika-home-kashmir` | Kashmir lake and Himalayan peaks at dawn | OpenAI image generation | Home hero and destination cards |
| `assets/images/home/pathika-home-jodhpur` | Mehrangarh Fort above Jodhpur at sunset | OpenAI image generation | Home hero and heritage cards |
| `assets/images/home/pathika-home-maldives` | Maldives island reef in turquoise water | OpenAI image generation | Home hero and island cards |
| `assets/images/home/pathika-home-kerala` | Houseboat on a Kerala palm-lined canal | OpenAI image generation | Home Kerala cards and story |
| `assets/images/home/pathika-home-dubai` | Abra crossing Dubai Creek at blue hour | OpenAI image generation | Home city cards |
| `assets/images/domestic/pathika-domestic-ladakh` | Ladakh mountain pass above an alpine lake | OpenAI image generation | Domestic hero |
| `assets/images/domestic/pathika-domestic-andaman` | Andaman white-sand beach and clear shallows | OpenAI image generation | Domestic islands card |
| `assets/images/international/pathika-international-alps` | Swiss village and lake beneath Alpine peaks | OpenAI image generation | International Alpine destination cards |

## Selected video sources — not downloaded yet

Source pages and the [Pexels License](https://www.pexels.com/license/) were checked on 2026-10-07. Pexels permits free website/commercial use and modification, with no required attribution; it prohibits implying endorsement and certain other uses. These are decorative landscape clips, not representations of Pathika-owned properties or partnerships. Network downloads are blocked in this workspace. The files below do **not** currently exist and are not referenced by the rendered website. `scripts/download-videos.cjs` downloads from the source CDN and optimises them when run with FFmpeg and network access; `scripts/build.cjs` includes only locally available clips.

| Intended local asset | Original source / creator | Source page | Original download URL | License | Intended use |
|---|---|---|---|---|---|
| `assets/videos/domestic-journey.mp4` | Pexels / Outcast | [Drone Footage Of Mountain](https://www.pexels.com/video/drone-footage-of-mountain-4218249/) | https://videos.pexels.com/video-files/4218249/4218249-hd_1920_1080_30fps.mp4 | [Pexels License](https://www.pexels.com/license/) | Domestic hero: Himalayan valley |
| `assets/videos/international-journey.mp4` | Pexels / Videographer Shiyaz | [An Aerial Shot of a Beach Resort in Maldives](https://www.pexels.com/video/an-aerial-shot-of-a-beach-resort-in-maldives-4022224/) | https://videos.pexels.com/video-files/4022224/4022224-uhd_3840_2160_25fps.mp4 | [Pexels License](https://www.pexels.com/license/) | International hero: Maldives coast |

Intended local output: 18 seconds, 1280×720, 24fps, H.264 MP4, no audio, fast-start metadata. The international original is 4K; it is transcoded rather than published in its original size. Actual output size and playback must be checked after a successful download.
