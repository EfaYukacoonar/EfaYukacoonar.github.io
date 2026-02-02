const API_KEY = '6ad7c3b262384cf1ac9133000260102';
// till 2026-02-15
export async function getEnvironmentData(lat, lon) {
    const url = `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${lat},${lon}&days=1&aqi=no&alerts=no`;
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed the API request');
        const data = await response.json();
        return {
            temp: data.current.temp_c,
            pressure: data.current.pressure_mb,
            humidity: data.current.humidity,
            wind: {
                speed: data.current.wind_kph / 3.6,
                deg: data.current.wind_degree
            },
            sun: {
                sunrise: data.forecast.forecastday[0].astro.sunrise,
                sunset: data.forecast.forecastday[0].astro.sunset
            },
            visibility: data.current.vis_km        
        };
    }
    catch (e) {console.error("Failed getting the weather data:", e)
        return {
            temp: 15,
            pressure: 1013.25,
            humidity: 0,
            wind: {
                speed: 0,
                deg: 0
            },
            sun: {
                sunrise: "06:00 AM",
                sunset: "06:00 PM"
            }
        };
    }
}