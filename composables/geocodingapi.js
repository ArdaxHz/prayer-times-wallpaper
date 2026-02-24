export const location = ref(null);

let geocoderReady = null;

function loadGoogleMaps() {
    if (geocoderReady) return geocoderReady;

    geocoderReady = new Promise((resolve, reject) => {
        if (window.google?.maps?.Geocoder) {
            resolve(new window.google.maps.Geocoder());
            return;
        }

        const config = useRuntimeConfig();
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${config.public.googleApiKey}`;
        script.async = true;
        script.onload = () => resolve(new window.google.maps.Geocoder());
        script.onerror = () => reject(new Error('Failed to load Google Maps'));
        document.head.appendChild(script);
    });

    return geocoderReady;
}

export async function fetchCoordsLocation(latitude, longitude) {
    const geocoder = await loadGoogleMaps();

    return new Promise((resolve, reject) => {
        geocoder.geocode({ location: { lat: latitude, lng: longitude } }, (results, status) => {
            if (status === 'OK' && results?.length > 0) {
                resolve({ status: 'OK', results });
            } else {
                reject(new Error(`Geocoding failed: ${status}`));
            }
        });
    });
}

export function getCurrentLocationNames(currentLocation) {
    const locality = currentLocation.filter(element => element.types.includes('locality'))[0]?.long_name ?? null
    const sublocality = currentLocation.filter(element => element.types.includes('sublocality'))[0]?.long_name ?? null
    const postal_town = currentLocation.filter(element => element.types.includes('postal_town'))[0]?.long_name ?? null
    const administrative_area_level_1 = currentLocation.filter(element => element.types.includes('administrative_area_level_1'))[0]?.long_name ?? null
    const administrative_area_level_2 = currentLocation.filter(element => element.types.includes('administrative_area_level_2'))[0]?.long_name ?? null
    const country = currentLocation.filter(element => element.types.includes('country'))[0]?.long_name ?? null

    const area = locality ?? postal_town ?? administrative_area_level_1 ?? administrative_area_level_2 ?? sublocality

    return {
        "area": area,
        "city": area,
        "country": country
    }
}
