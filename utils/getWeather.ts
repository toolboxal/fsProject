export const getWeather = async (
  latitude: number,
  longitude: number,
  timeZone: string
) => {
  console.log('timezone', timeZone)
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,weather_code&timezone=${timeZone}&forecast_days=1`

  const data = await fetch(url)
  console.log('weather data', data)
}
