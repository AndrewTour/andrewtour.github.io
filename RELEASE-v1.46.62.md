# AGNT v1.46.62 — Motion first pass

Built on v1.46.61 Performance Toolbar (GitHub commit `e30602f`).

- The cold-start screen fades once the destination is ready. Warm returns keep an open call outcome or SMS confirmation in place.
- Bottom tabs fade briefly. Existing detail navigation uses a short directional movement. Selected sheets enter and dismiss without adding a delay to their actions.
- Today updates counts immediately. On a manual metric change, the ring and daily score bar ease towards the new value. Expected pace and historical values are drawn directly. The knocking ring can ease when the displayed percentage changes during a running session.
- The next seller or Hotspotting contact fades in without animating the outreach controls. Sync refreshes preserve the SMS preview or confirmation while it is open.
- Motion respects Reduce Motion. The sheets use an immediate fallback in browsers that lack the required CSS support.

Use the existing GitHub Pages and Firebase configuration. Upload the archive contents with the `icons/` and `android/` directories intact.
