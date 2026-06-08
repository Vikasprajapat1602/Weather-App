import { useState } from "react";
import "./App.css";
import {
  getWeather,
  getForecast,
  getWeatherByCoords,
  getAirQuality,
} from "./services/weatherService";

function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [forecast, setForecast] = useState([]);
  const weatherCondition =
    weather?.weather[0]?.main || "";

  const [recentSearches, setRecentSearches] = useState(() => {
    return JSON.parse(
      localStorage.getItem("recentSearches")
    ) || [];
  });

  const [aqi, setAqi] = useState(null);
  const handleSearch = async () => {
    try {
      setError("");
      setLoading(true);
      const data = await getWeather(city);
      setWeather(data);

      const airData =
        await getAirQuality(
          data.coord.lat,
          data.coord.lon
        );

      setAqi(
        airData.list[0].main.aqi
      );
      
      const updatedSearches = [
        city,
        ...recentSearches.filter(
          (item) =>
            item.toLowerCase() !==
            city.toLowerCase()
        ),
      ].slice(0, 5);

      setRecentSearches(updatedSearches);

      localStorage.setItem(
        "recentSearches",
        JSON.stringify(updatedSearches)
      );
      const forecastData = await getForecast(city);

      setForecast(
        forecastData.list.filter((item, index) => index % 8 === 0)
      );

      // eslint-disable-next-line no-unused-vars
    } catch (error) {
      setError("City not found");
    } finally {
      setLoading(false);
    }
  };


  const getCurrentLocationWeather = () => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } =
            position.coords;

          const data =
            await getWeatherByCoords(
              latitude,
              longitude
            );

          setWeather(data);

          const forecastData =
            await getForecast(data.name);

          setForecast(
            forecastData.list.filter(
              (item, index) =>
                index % 8 === 0
            )
          );
          // eslint-disable-next-line no-unused-vars
        } catch (error) {
          setError(
            "Unable to fetch location weather"
          );
        }
      },
      () => {
        setError(
          "Location permission denied"
        );
      }
    );
  };

  return (
    <div className={`app ${weatherCondition.toLowerCase()}`}>
      <div className="container">
        <h1 className="title">Weather Forecasting Application</h1>

        <div className="search-box">
          <input
            type="text"
            placeholder="Enter city name..."
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
          />

          <button onClick={handleSearch}>
            {loading ? "Loading..." : "Search"}
          </button>
        </div>

        {recentSearches.length > 0 && (
          <div className="recent-searches">
            <h3>Recent Searches</h3>

            <div className="recent-list">
              {recentSearches.map(
                (item, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setCity(item);
                    }}
                  >
                    {item}
                  </button>
                )
              )}
            </div>
          </div>
        )}
        {error && <p>{error}</p>}
        <div className="location-btn-container">
          <button
            className="location-btn"
            onClick={getCurrentLocationWeather}
          >
            Use My Location
          </button>
        </div>


        {weather && (
          <div className="weather-card">
            <h2>{weather.name}</h2>

            <h1>
              {Math.round(weather.main.temp)}°C
            </h1>

            <p>
              {weather.weather[0].main}
            </p>

            <div className="details">
              <div>
                <span>Humidity</span>
                <h3>{weather.main.humidity}%</h3>
              </div>

              <div>
                <span>Wind Speed</span>
                <h3>{weather.wind.speed} m/s</h3>
              </div>
              <div>
                <span>Feels Like</span>
                <h3>{Math.round(weather.main.feels_like)}°C</h3>
              </div>
              <div>
                <span>Pressure</span>
                <h3>{weather.main.pressure} hPa</h3>
              </div>
              <div>
                <span>Visibility</span>
                <h3>{weather.visibility / 1000} km</h3>
              </div>
              <div>
                <span>Sunrise</span>
                <h3>
                  {new Date(weather.sys.sunrise * 1000).toLocaleTimeString()}
                </h3>
              </div>
              <div>
                <span>Sunset</span>
                <h3>
                  {new Date(weather.sys.sunset * 1000).toLocaleTimeString()}
                </h3>
              </div>

            </div>
          </div>

        )}

        {aqi && (
          <div className="aqi-card">
            <h2>Air Quality Index</h2>

            <h1>{aqi}</h1>

            <p>
              {aqi === 1 && "Good"}
              {aqi === 2 && "Fair"}
              {aqi === 3 && "Moderate"}
              {aqi === 4 && "Poor"}
              {aqi === 5 && "Very Poor"}
            </p>
          </div>
        )}



        {forecast.length > 0 && (
          <div className="forecast-section">
            <h2>5-Day Forecast</h2>

            <div className="forecast-cards">
              {forecast.slice(0, 5).map((day, index) => (
                <div className="forecast-card" key={index}>
                  <p>
                    {new Date(day.dt_txt).toLocaleDateString(
                      "en-US",
                      {
                        weekday: "short",
                      }
                    )}
                  </p>

                  <img
                    src={`https://openweathermap.org/img/wn/${day.weather[0].icon}.png`}
                    alt="weather"
                  />

                  <h3>
                    {Math.round(day.main.temp)}°C
                  </h3>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default App;