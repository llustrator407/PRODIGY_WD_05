const cityInput = document.getElementById('cityInput');
const getWeatherBtn = document.getElementById('getWeatherBtn');
const getGeolocationBtn = document.getElementById('getGeolocationBtn');
const weatherResult = document.getElementById('weatherResult');
const weatherCard = document.getElementById('weatherCard');
const locationName = document.getElementById('locationName');
const weatherIconDiv = document.getElementById('weatherIcon');
const weatherDescription = document.getElementById('weatherDescription');
const currentTemp = document.getElementById('currentTemp');
const feelsLikeTemp = document.getElementById('feelsLikeTemp');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('windSpeed');
const pressure = document.getElementById('pressure');
const uvIndex = document.getElementById('uvIndex');
const messageBox = document.getElementById('messageBox');
const messageText = document.getElementById('messageText');
const forecastContainer = document.getElementById('forecast');

const GEOCODING_API_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const WEATHER_API_URL = 'https://api.open-meteo.com/v1/forecast';

function showMessage(message, isError = false) {
    messageText.textContent = message;
    messageBox.classList.remove('hidden');
    if (isError) {
        messageBox.classList.add('bg-red-800', 'border-red-600', 'text-red-200');
        messageBox.classList.remove('bg-green-800', 'border-green-600', 'text-green-200');
    } else {
        messageBox.classList.add('bg-green-800', 'border-green-600', 'text-green-200');
        messageBox.classList.remove('bg-red-800', 'border-red-600', 'text-red-200');
    }
}

function hideAll() {
    weatherResult.classList.add('hidden', 'opacity-0');
    weatherResult.classList.remove('opacity-100');
    messageBox.classList.add('hidden');
}

async function fetchWeatherData(lat, lon) {
    hideAll();
    showMessage('Fetching weather data...', false);

    const params = new URLSearchParams({
        latitude: lat,
        longitude: lon,
        current_weather: true,
        daily: ['temperature_2m_max', 'temperature_2m_min', 'uv_index_max', 'weathercode'],
        timezone: 'auto'
    });

    try {
        const response = await fetch(`${WEATHER_API_URL}?${params.toString()}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        displayWeather(data);
    } catch (error) {
        console.error('Error fetching weather data:', error);
        showMessage('Failed to fetch weather data. Please try again later.', true);
    }
}

function displayWeather(data) {
    const currentWeather = data.current_weather;
    const daily = data.daily;
    
    locationName.textContent = data.timezone.split('/').pop().replace(/_/g, ' ');

    const weatherCode = currentWeather.weathercode;
    const weatherText = getWeatherDescription(weatherCode);
    weatherDescription.textContent = weatherText;
    weatherIconDiv.innerHTML = getWeatherSvgIcon(weatherCode, true);

    const themeClass = getWeatherTheme(weatherCode);
    weatherCard.className = `rounded-2xl p-6 shadow-inner border border-gray-700 text-white transition-all duration-500 ${themeClass}`;
    
    currentTemp.textContent = Math.round(currentWeather.temperature);
    feelsLikeTemp.textContent = Math.round(currentWeather.temperature);
    humidity.textContent = currentWeather.relativehumidity_2m ? Math.round(currentWeather.relativehumidity_2m) : '--';
    windSpeed.textContent = currentWeather.windspeed ? currentWeather.windspeed : '--';
    pressure.textContent = currentWeather.pressure_msl ? currentWeather.pressure_msl : '--';
    uvIndex.textContent = daily.uv_index_max && daily.uv_index_max.length > 0 ? daily.uv_index_max[0] : '--';
    
    displayForecast(daily);
    
    weatherResult.classList.remove('hidden');
    setTimeout(() => {
        weatherResult.classList.remove('opacity-0');
        weatherResult.classList.add('opacity-100');
    }, 50);

    messageBox.classList.add('hidden');
}

function displayForecast(daily) {
    forecastContainer.innerHTML = '';
    for (let i = 0; i < daily.time.length; i++) {
        const date = new Date(daily.time[i]);
        const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'short' });
        const weatherCode = daily.weathercode[i];
        const weatherText = getWeatherDescription(weatherCode);
        const tempMax = Math.round(daily.temperature_2m_max[i]);
        const tempMin = Math.round(daily.temperature_2m_min[i]);
        const svgIcon = getWeatherSvgIcon(weatherCode);
        
        const themeClass = getWeatherTheme(weatherCode);

        const forecastDayHtml = `
                <div class="flex items-center justify-between p-4 rounded-xl backdrop-blur-sm shadow-sm border border-gray-700 ${themeClass}">
                    <span class="text-lg font-semibold w-1/4 text-white">${dayOfWeek}</span>
                    <div class="w-1/4 flex items-center justify-center">${svgIcon}</div>
                    <p class="text-sm capitalize w-1/4 text-white text-center">${weatherText}</p>
                    <span class="text-lg font-bold w-1/4 text-right text-white">${tempMax}° / ${tempMin}°</span>
                </div>
            `;
        forecastContainer.innerHTML += forecastDayHtml;
    }
}

function getWeatherDescription(code) {
    const descriptions = {
        0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
        45: 'Fog', 48: 'Depositing rime fog', 51: 'Light drizzle', 53: 'Moderate drizzle',
        55: 'Dense drizzle', 56: 'Light freezing drizzle', 57: 'Dense freezing drizzle',
        61: 'Slight rain', 63: 'Moderate rain', 65: 'Heavy rain', 66: 'Light freezing rain',
        67: 'Heavy freezing rain', 71: 'Slight snow fall', 73: 'Moderate snow fall',
        75: 'Heavy snow fall', 77: 'Snow grains', 80: 'Slight rain showers',
        81: 'Moderate rain showers', 82: 'Violent rain showers', 85: 'Slight snow showers',
        86: 'Heavy snow showers', 95: 'Thunderstorm', 96: 'Thunderstorm with slight hail',
        99: 'Thunderstorm with heavy hail'
    };
    return descriptions[code] || 'Unknown';
}

function getWeatherTheme(code) {
    const themes = {
        'clear': 'bg-gradient-to-br from-yellow-700 to-amber-800 text-gray-100',
        'clouds': 'bg-gradient-to-br from-gray-700 to-gray-900',
        'rain': 'bg-gradient-to-br from-sky-700 to-blue-900',
        'snow': 'bg-gradient-to-br from-gray-200 to-sky-500 text-gray-900',
        'thunderstorm': 'bg-gradient-to-br from-gray-800 to-gray-900',
        'fog': 'bg-gradient-to-br from-gray-500 to-gray-700',
        'default': 'bg-gradient-to-br from-blue-700 to-purple-800',
    };

    if ([0, 1].includes(code)) return themes.clear;
    if ([2, 3].includes(code)) return themes.clouds;
    if ([45, 48].includes(code)) return themes.fog;
    if ([51, 53, 55, 56, 57].includes(code)) return themes.rain;
    if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return themes.rain;
    if ([71, 73, 75, 77, 85, 86].includes(code)) return themes.snow;
    if ([95, 96, 99].includes(code)) return themes.thunderstorm;
    return themes.default;
}

function getWeatherSvgIcon(code) {
    const icons = {
        'clear': `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-sun"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`,
        'cloudy': `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-cloud"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path></svg>`,
        'rain': `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-cloud-rain"><line x1="16" y1="13" x2="16" y2="21"></line><line x1="8" y1="13" x2="8" y2="21"></line><line x1="12" y1="15" x2="12" y2="23"></line><path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"></path></svg>`,
        'snow': `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-cloud-snow"><path d="M20 17.58A5 5 0 0 0 18 8h-1.26A8 8 0 1 0 4 16.25"></path><line x1="8" y1="16" x2="8" y2="16.01"></line><line x1="8" y1="20" x2="8" y2="20.01"></line><line x1="12" y1="18" x2="12" y2="18.01"></line><line x1="12" y1="22" x2="12" y2="22.01"></line><line x1="16" y1="20" x2="16" y2="20.01"></line><line x1="16" y1="22" x2="16" y2="22.01"></line></svg>`,
        'thunderstorm': `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-cloud-lightning"><path d="M19 16.9A5 5 0 0 0 18 7h-4a8 8 0 0 0-8 8c0 1.5.25 3 .7 4.11"></path><polyline points="14 12 10 18 14 18 10 24"></polyline></svg>`,
        'fog': `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-align-justify"><line x1="21" y1="10" x2="3" y2="10"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="21" y1="18" x2="3" y2="18"></line></svg>`,
        'default': `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-alert-circle"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`,
    };
    
    if ([0, 1].includes(code)) return icons.clear;
    if ([2, 3].includes(code)) return icons.cloudy;
    if ([45, 48].includes(code)) return icons.fog;
    if ([51, 53, 55, 56, 57].includes(code)) return icons.rain;
    if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return icons.rain;
    if ([71, 73, 75, 77, 85, 86].includes(code)) return icons.snow;
    if ([95, 96, 99].includes(code)) return icons.thunderstorm;
    return icons.default;
}

getWeatherBtn.addEventListener('click', async () => {
    const cityName = cityInput.value.trim();
    if (cityName) {
        hideAll();
        showMessage('Finding city...', false);
        try {
            const response = await fetch(`${GEOCODING_API_URL}?name=${cityName}&count=1`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            if (data.results && data.results.length > 0) {
                const { latitude, longitude } = data.results[0];
                locationName.textContent = `${data.results[0].name}, ${data.results[0].country}`;
                fetchWeatherData(latitude, longitude);
            } else {
                showMessage('City not found. Please try a different name.', true);
            }
        } catch (error) {
            console.error('Error fetching city coordinates:', error);
            showMessage('Failed to find city. Please check the name and try again.', true);
        }
    } else {
        showMessage('Please enter a city name.', true);
    }
});

getGeolocationBtn.addEventListener('click', () => {
    hideAll();
    showMessage('Getting your location...', false);
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                const { latitude, longitude } = position.coords;
                locationName.textContent = 'Your Location';
                fetchWeatherData(latitude, longitude);
            },
            error => {
                console.error('Geolocation error:', error);
                showMessage('Unable to retrieve your location. Please ensure location services are enabled and permissions are granted.', true);
            }
        );
    } else {
        showMessage('Geolocation is not supported by your browser.', true);
    }
});