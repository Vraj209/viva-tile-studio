# Sitewide motion

Implemented September 29, 2026. This is a motion enhancement of the existing VAVI site: its typography, palette, composition, content, source imagery, anchors, and conversion flow are preserved.

## Ownership and behavior

- `src/components/SiteMotion.tsx` mounts in the root layout. There is one document-level Lenis instance, driven by the existing GSAP ticker. No extra page scroller, automatic snapping, or new pinned section was introduced.
- `src/lib/scroll.ts` owns wheel interpolation (`lerp: .14`), anchor navigation, history synchronization, initial fragment alignment, batched geometry refreshes, and reference-counted overlay locks. Programmatic scrolling uses `scrollToTarget`; menus and dialogs acquire a `lockPageScroll` release function.
- Touch remains native (`syncTouch: false`). Reduced motion destroys Lenis and removes optional GSAP transforms/entrances. Both preferences and viewport changes are handled while the page is open.
- Fonts, image loads, body/panel resizing, details toggles, and route changes refresh measurements. A pending initial hash stays aligned through client-only story initialization until the visitor interacts. Next retains ownership of route and browser history restoration.
- `src/lib/site-motion.ts` supplies opt-in section choreography. Hero copy enters with 8px travel; text-led sections use small grouped entrances; process steps are lightly staggered; specifications, FAQ, enquiry, and footer become quieter. Forms, navigation, specification rows, and FAQ controls remain stable. Offscreen copy stays fully readable until its entrance begins, and focus completes relevant entrances immediately.
- Parallax follows scroll progress in both directions (`scrub: true`) and stays at its current position when scrolling settles. Atelier depth is on the shared stage so the tile art and hit areas move together, while captions and the pause control stay still. Its travel is 64px desktop / 20px narrow or touch screens. The enquiry tile floats gently beside stable form copy.
- SpaceWorlds and footer imagery move inside stationary apertures with 9% overscan and 7% total vertical travel on fine-pointer desktop screens. Narrow and touch screens use 4% overscan and 2.5% total travel. Fullscreen interiors use lighter continuous depth too. Reduced motion disables all parallax. Existing gallery tile assets stay uncropped.
- The gallery and tile story read ScrollTrigger progress directly, avoiding an extra smoothing layer after Lenis. Gallery dragging, manual selection, inspection, and static mode remain intact; a wheel interruption starts from the currently painted pose.
- Made Around You keeps its existing document-scroll journey. Entry, category transitions, and exit share short-lived locks; exploration releases them. Closing restores the original document geometry, exact position, and opener focus. Only nearby journey images are loaded.
- Responsive motion uses local media listeners and GSAP contexts. This avoids a GSAP 3.15 global matchMedia refresh path that reset scroll during orientation changes in testing. Cleanup removes owned triggers, timers, listeners, observers, and ticker callbacks.
- The original hero and transparent logo assets now use responsive Next Image renditions. At 412px/DPR1.75, hero transfer was 43,618 bytes versus 737,712 original bytes; the header logo was 23,328 bytes versus 1,016,028. Source files, dimensions, crops, colors, and logo filters were retained.

Installed versions: Lenis 1.3.26, GSAP 3.15.0, Next.js 16.3.6. Implementation was checked against installed Next/Lenis documentation and the official [Lenis integration guide](https://github.com/darkroomengineering/lenis) and [ScrollTrigger documentation](https://gsap.com/docs/v3/Plugins/ScrollTrigger/).

## Verification

- Production build, TypeScript, ESLint, `git diff --check`, and all 33 existing tests pass.
- `work/site-motion/verify.cjs` passes against the production build at 1440×960, 390×844, 320×568, and 768×1024. It covers wheel interpolation/settling, native touch swipe, mobile menu lock/anchors, URL and focus behavior, Back/Forward restoration, back-to-top, fullscreen categories/exit/focus, image overscan, live reduced-motion changes, direct fragments, no-JavaScript readability, and browser exceptions.
- Saved sitewide results: `work/site-motion/results.json`; screenshots are alongside it.
- Follow-up parallax checks: all 19 checks in `work/site-motion/parallax-scroll.cjs` pass against the updated production build. `parallax-results-production.json` records forward/reverse scroll coupling, stationary transforms after scroll settles, safe image apertures, narrow/touch behavior, hero pause, and reduced-motion cleanup. The current 561px-wide in-app preview was also checked: advancing document scroll to 792px moved the hero stage to 10.31px depth, confirming parallax is active at that width. The quick native-scroll/reduced-motion switch also exposed and fixed a Lenis delayed-class cleanup race by stopping the instance before destruction.
- Existing gallery suite passes desktop, mobile, reduced motion, portrait/landscape rotation, manual motion toggling, and desktop resizing. Evidence: `work/site-motion-gallery/verified/report.json`.
- Additional gallery handoff, layout-refresh, exact dialog scroll locking, and short-mobile dialog scrolling pass. Evidence: `work/site-motion-gallery/handoff-report.json`.
- Interactive journey checks additionally covered browser Back, resize while exploring, final CTA prefill, and focus transfer to the enquiry form.
- Automated browser coverage is Chrome, including mobile emulation. Physical iOS/Safari and Firefox were not tested. There is currently one content route; root-layout mounting supports subsequent routes without creating another scroller.

## Performance evidence

The initial implementation's local production Lighthouse mobile simulation recorded performance **91**, accessibility **100**, LCP **3.5s**, total blocking time **50ms**, CLS **0**. This predates the follow-up parallax tuning and is a lab run, not field Core Web Vitals or an INP measurement. The 2.5s LCP target remains unmet under the simulated mobile conditions. The report retains an unscored accessible-name advisory for existing controls.

Reports: `work/site-motion/lighthouse.report.html` and `.json`. Lighthouse wrote both complete reports, then its Windows Chrome launcher encountered an EPERM error removing its temporary browser profile; report values are read from the saved final audit, not inferred from the command's exit status.

## Reproduce

```powershell
npm run build
npm run start -- --port 3002
# In another terminal; PLAYWRIGHT_MODULE can point to another installed Playwright:
node work/site-motion/verify.cjs
```

Future image motion should have its own inner wrapper, preserve image overscan, and avoid transforming a surface already owned by the atelier, gallery, or journey. New copy groups can opt in with `data-motion` and `data-motion-item`; new layout-changing components should call `requestScrollRefresh` after their geometry settles.
