# Waypoint V10.5.1 — Trip type cleanup

- The Trip type / Tipo de viaje dropdown now lists only trip purposes (leisure, business, family visit, romantic, etc.).
- The old Beach / City / Adventure / Winter choices are no longer shown in the creation/edit dropdown.
- Previously saved legacy types remain in storage unchanged until the owner saves an edited trip; the form displays Leisure / Vacation for legacy types, which will then be saved as the new purpose. This does not touch any itineraries, checklist items, reservations, or other data.
- Legacy display labels no longer say `(previous category)` / `(categoría anterior)` anywhere.
- Web and iOS mirrored HTML updated; service worker cache incremented.

Deploy to the existing repository and Railway service; retain /data and the site's local data.
