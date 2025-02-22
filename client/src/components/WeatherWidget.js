import React, { useState, useEffect } from 'react';
import axios from 'axios';

const WeatherWidget = () => {
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    console.log("📍 User Location:", latitude, longitude);
                    fetchWeather(latitude, longitude);
                },
                (err) => {
                    console.error("🚨 Error fetching location:", err);
                    setError("Unable to retrieve location. Using Kampala, Uganda.");
                    fetchWeather(0.3476, 32.5825);
                }
            );
        } else {
            setError("Geolocation not supported. Using Kampala, Uganda.");
            fetchWeather(0.3476, 32.5825);
        }
    }, []);

    const fetchWeather = async (lat, lon) => {
        try {
            if (!lat || !lon) {
                throw new Error("No location data available.");
            }
            
            const apiKey = process.env.REACT_APP_OPENWEATHER_KEY;
            console.log("🔑 OpenWeather API Key:", apiKey);
            console.log("🌍 Fetching weather for:", lat, lon);

            const response = await axios.get(
                `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`
            );

            console.log("⛅ Weather API Response:", response.data);
            setWeather(response.data);
            setLoading(false);
        } catch (error) {
            console.error("🚨 Error fetching weather data:", error);
            setError("Failed to fetch weather data.");
            setLoading(false);
        }
    };

    if (loading) return <p style={{ color: 'white' }}>Loading weather...</p>;
    if (error) return <p style={{ color: 'white' }}>{error}</p>;

    return (
        <div style={{
            background: '#282c34', color: 'white', padding: '10px', borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
        }}>
            <img 
                src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}.png`} 
                alt="Weather icon" 
                width="50"
            />
            <div style={{ textAlign: 'center' }}>
                <h6 style={{ margin: 0 }}>{weather.name}</h6>
                <p style={{ margin: 0 }}>{weather.main.temp}°C - {weather.weather[0].description}</p>
            </div>
        </div>
    );
};

export default WeatherWidget;