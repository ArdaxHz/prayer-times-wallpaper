export default defineEventHandler(async (event) => {
    const { lat, lng } = getQuery(event);

    if (!lat || !lng) {
        throw createError({ statusCode: 400, statusMessage: 'lat and lng query parameters are required' });
    }

    const { googleApiKey } = useRuntimeConfig();
    if (!googleApiKey) {
        throw createError({ statusCode: 500, statusMessage: 'Google API key is not configured' });
    }

    const resultType = 'locality|sublocality|postal_code|country|administrative_area_level_1|administrative_area_level_2';
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${googleApiKey}&result_type=${resultType}`;

    const response = await $fetch(url);
    return response;
});
