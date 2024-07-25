function getTimeDate() {
  const timeNow = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })
  const todayDate = new Date().toLocaleDateString()

  let greeting = ''
  const hour = new Date().getHours()
  if (hour < 12) {
    greeting = 'good morning 👋'
  } else if (hour < 18) {
    greeting = 'good afternoon 🌤️😎'
  } else {
    greeting = 'good evening 🌘'
  }
  return { timeNow, todayDate, greeting }
}
export default getTimeDate
