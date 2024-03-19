export async function forwardPolyGeocode(query) {
    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("q", query);
    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("countrycodes", "gb");
    url.searchParams.set("layer", "address");
    url.searchParams.set("polygon_geojson", 1);
    const response = await fetch(url);
    return await response.json();
}
