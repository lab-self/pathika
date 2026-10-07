# Pathika Tour & Travels

Premium static travel discovery and enquiry website for the `lab-self/pathikatravels` repository.

## Local preview and checks

Install Node.js for the build and developer checks only; the production site is plain static files.

```sh
node scripts/build.cjs
node scripts/check-http.cjs
```

The build creates `dist/`, validates the pages and local assets, and writes absolute canonical links, Open Graph URLs, `robots.txt`, a sitemap, and the web-manifest start URL. The site can be served from `dist/` by GitHub Pages, Nginx, Apache, Cloudflare Pages, Netlify or any normal static host. There is no production Node process, API, database, CMS, secret or server-side form.

To preview on Windows after building, run `py -m http.server 8000 --directory dist` and open `http://localhost:8000`. Stop the local server with Ctrl+C.

## Pages

- `/` - Home
- `/domestic/` - India destinations
- `/international/` - International destinations
- `/category/` - Filterable travel collections
- `/about/` - Pathika approach
- `/contact/` - Trip enquiry form
- `/booking-policies/` - Payment and cancellation terms
- `/404.html` - Not found page

The contact form opens a prefilled email draft to `info@pathikatravels.com`; visitors send it from their email app. Contact details already present in the project are retained. There is no live booking engine or WhatsApp integration.

## Publish on GitHub Pages

The repository includes `.github/workflows/pages.yml`. It builds and deploys `dist/` whenever you push to `main` or `master`, and can also be started manually from **Actions**.

1. Push the project to `https://github.com/lab-self/pathikatravels`.
2. In **Settings -> Pages -> Build and deployment**, select **GitHub Actions**.
3. Push a commit to the default branch, or run **Build and deploy Pathika on GitHub Pages** from the Actions tab. Wait for the green workflow result.
4. The default site URL is `https://lab-self.github.io/pathikatravels/`.

On GitHub Free the repository must be public for Pages; private repositories require a plan that supports private Pages publishing. See [GitHub Pages availability](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages#github-pages-availability).

The workflow reads the published site URL from GitHub Pages configuration and uses it for canonical URLs, Open Graph URLs, the sitemap, `robots.txt` and the not-found page base path. You do not need to add Actions variables for the domain.

## Connect a custom domain

Buy or use a domain you own. Using `www` as the primary address is a good option; GitHub can redirect between the apex domain and `www` when both have the correct DNS records.

1. Verify your domain in your GitHub account under **Settings -> Pages** (or the account's Pages domain verification settings). This helps prevent another GitHub user from claiming it.
2. In this repository, open **Settings -> Pages** and enter the custom domain before editing DNS. For a GitHub Actions publishing workflow, GitHub stores this Pages setting; the workflow does not require a committed `CNAME` file.
3. At your domain provider, add DNS records. For `www.example.com`, create a `CNAME` record: name `www`, value `lab-self.github.io` (do not add the repository name). For the apex `example.com`, use all four GitHub Pages `A` records below, or the provider's supported `ALIAS`/`ANAME` record. Remove conflicting default parking records.

   | Type | Name | Value |
   |---|---|---|
   | A | `@` | `185.199.108.153` |
   | A | `@` | `185.199.109.153` |
   | A | `@` | `185.199.110.153` |
   | A | `@` | `185.199.111.153` |
   | CNAME | `www` | `lab-self.github.io` |

   GitHub also publishes optional IPv6 `AAAA` records. See the official DNS instructions before adding them.

4. Push a commit or run the workflow again. It reads the domain configured in **Settings -> Pages** and generates matching canonical URLs and sitemap entries. When DNS has propagated and GitHub has issued the certificate, enable **Enforce HTTPS** in **Settings -> Pages**.
6. Check DNS from Windows with `Resolve-DnsName www.example.com` and `Resolve-DnsName example.com`. DNS updates may take time to propagate.

Replace the example hosts with the domain you own. Do not create wildcard DNS records. GitHub's current instructions are [custom domain setup](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site), [DNS records](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site#configuring-an-apex-domain), and [HTTPS](https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https).

## Images, video and search

Image assets and their sources are listed in [IMAGE-SOURCES.md](IMAGE-SOURCES.md). The site uses 62 distinct 2400 x 1600 photographs with responsive variants. Superseded images and empty asset folders have been removed. The supplied Pathika logo is unchanged.

Pexels video sources are selected and documented, but the video files have not yet been downloaded. Network access and FFmpeg were unavailable in the workspace. Until clips are downloaded, the Domestic and International heroes use local images. On a network-enabled development machine with FFmpeg installed, run `node scripts/download-videos.cjs`, then rebuild. Failed downloads do not add broken video references.

A high search ranking cannot be guaranteed. After deployment, verify the exact domain in [Google Search Console](https://search.google.com/search-console/about), submit `/sitemap.xml`, and add a Google Business Profile only for a real, verified business. Never add invented prices, reviews, locations, or company statistics.

## Security and privacy

Every deployed HTML, CSS, JavaScript, JSON and image file is public. Do not put credentials or private keys in the repository. The current static form creates a `mailto:` draft; there is no custom mail server or API key. The GitHub Pages workflow grants read-only content access plus the Pages deployment permissions it needs. A static site host serves these files; runtime HTTP security headers depend on that host.

## Checks and limits

- `node scripts/check.cjs` validates page structure, local links/fragments, responsive image files, alt text, image dimensions, collections, distinct Home/Domestic/International image sets, and any local video references.
- `node scripts/check-http.cjs` builds and smoke-tests direct route refreshes, page stylesheets/scripts, and a nested 404 against a local static-file server.
- `node scripts/check-ui.cjs` runs DOM interaction checks when LinkeDOM is available in the local Node module path.
- `node --check scripts/build.cjs` and `node --check js/site.js` check JavaScript syntax.

These checks passed in the workspace. Headless Chrome could not start in the available environment, so browser screenshots at the requested viewport sizes and Lighthouse scores have not been verified. The local HTTP smoke test cannot guarantee that a future GitHub account, DNS provider or domain is configured correctly.

## Image and logo refresh verification (2026-10-07)

- Fixed hero overlay stacking so headings and controls remain above the shading; reduced the shading and added a light navigation background.
- Replaced repeated travel imagery with 62 distinct 2400 x 1600 photographs and 480px, 768px and 1200px variants. Hero image selection also accounts for tall mobile layouts. Source files were checked for duplicate content.
- Restored the original coloured logo in every footer; the supplied logo file is unchanged.
- Successful Chromium checks on all seven content pages at 1440 x 960 and 390 x 960: no broken images or horizontal overflow, correct hero stacking and no logo recolouring filter. Screenshots of the heroes, collections and footer were reviewed.
- The production build passed the existing eight-page checks for both source and dist. Earlier browser-launch failures above no longer block these checks.
