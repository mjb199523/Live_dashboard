# Aviation Enhancements & Map Search

## Execution Plan
- [x] Update `layers.ts` to move flights to 'Aviation' below 'Maritime'
- [x] Backend: Add `/api/flights/:icao24/track` endpoint in Express
- [x] Frontend: Make flights clickable in `MapView` and render `PathLayer` route
- [x] Generate `public/country_centroids.json`
- [x] Frontend: Create `MapSearch.tsx` for country autocomplete
- [x] Frontend: Hook `MapSearch` into `MapView` state to fly to locations
- [x] Add CSS for `MapSearch` component
