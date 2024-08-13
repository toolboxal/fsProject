function getTimeDate() {
  const timeNow = new Date().toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  })
  const todayDate = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  })

  return { timeNow, todayDate }
}
export default getTimeDate
