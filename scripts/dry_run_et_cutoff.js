const d = new Date()
function getTomorrowStartIsoInTimeZone(d, timeZone = 'America/New_York') {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).formatToParts(d)
  const map = parts.reduce((acc, p) => {
    if (p.type !== 'literal') acc[p.type] = p.value
    return acc
  }, {})

  const year = Number(map.year)
  const month = Number(map.month)
  const day = Number(map.day)

  const utcHour = Number(
    new Intl.DateTimeFormat('en-US', {timeZone: 'UTC', hour: 'numeric', hour12: false}).format(d),
  )
  const tzHour = Number(
    new Intl.DateTimeFormat('en-US', {timeZone, hour: 'numeric', hour12: false}).format(d),
  )
  const offsetHours = (utcHour - tzHour + 24) % 24

  const utcMillis = Date.UTC(year, month - 1, day + 1, offsetHours, 0, 0)
  return new Date(utcMillis).toISOString()
}

console.log('now (UTC):', d.toISOString())
console.log('tomorrowStartIso (ET midnight -> UTC):', getTomorrowStartIsoInTimeZone(d))
