function convertFloatToTime(floatTime: number): string {
  const hours = Math.floor(floatTime)
  const minutes = Math.round((floatTime - hours) * 60)
  if (hours === 0 && minutes !== 0) {
    return `${minutes}m`
  } else if (hours === 0 && minutes === 0) {
    return '--'
  } else if (hours !== 0 && minutes === 0) {
    return `${hours}h`
  }
  return `${hours}h ${minutes}m`
}

export default convertFloatToTime
