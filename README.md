**Real-time Weather Forecast API**

*Overview*
The Real-time Weather Forecast API is a RESTful service that allows users to manage locations and retrieve real-time weather forecasts for specified locations. The API integrates with an external weather service to fetch current weather data and supports operations for adding, retrieving, updating, and deleting locations.

*Features*

    Location Management:
        Add Location        : Add a new location with name, latitude, and longitude.
        Retrieve Locations  : Get all locations or a specific location by ID.
        Update Location     : Update details of a specific location by ID.
        Delete Location     : Delete a specific location by ID.

    Weather Forecast:
        Retrieve real-time weather forecasts for a specific location, including temperature, humidity, and wind speed.

    Historical Data:
        Retrieve historical weather data summaries for the last 7, 15, and 30 days.

*Endpoints (Postman collection is added)*

    /locations (GET, POST):
        GET    - Retrieve all locations.
        POST   - Add a new location.
    /locations/<location_id> (GET, PUT, DELETE):
        GET    - Retrieve a specific location by ID.
        PUT    - Update a specific location by ID.
        DELETE - Delete a specific location by ID.
    /weather/<location_id> (GET):
        GET    - Retrieve the weather forecast for a specific location by ID.      
    /history (GET):
        Retrieve historical weather data for the last 7, 15, or 30 days.


*Technical Details*

    External Weather Service Integration:
        Fetches real-time weather data using external APIs (e.g., OpenWeatherMap, WeatherAPI) based on location coordinates.

    Caching Mechanism:
        Implements caching to reduce the number of external API calls and improve response times.

    Error Handling:
        Handles errors gracefully for unavailable services and invalid location data.

    Validation:
        Proper validation for location data to handle edge cases.

    Rate Limiting:
        Implements rate limiting to prevent API abuse.

    Logging:
        Logs API requests, especially those interacting with the external service for monitoring and debugging purposes.

    Environment Variables:
        Uses environment variables to manage sensitive information like API keys.
