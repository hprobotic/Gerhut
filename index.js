const asciichart = require('asciichart')
const fetch = require('node-fetch')

async function main (alphaVantageAPIKey) {
  const url = new URL('/query', 'https://www.alphavantage.co/')
  url.searchParams.set('function', 'TIME_SERIES_DAILY')
  url.searchParams.set('symbol', 'MSFT')
  url.searchParams.set('apikey', alphaVantageAPIKey)

  const response = await fetch(url.toString())
  if (!response.ok) {
    throw Error(`HTTP ${response.status}`)
  }

  const data = await response.json()
  const meta = data['Meta Data']
  const series = data['Time Series (60min)']
  const prices = Object.keys(series).sort().map(function (time) {
    const price = Number(series[time]['4. close'])
    return Number.isFinite(price) ? price : undefined
  })

  return `${asciichart.plot(prices)}\n\nLast Refreshed: ${meta['3. Last Refreshed']}`
}

if (require.main === module) {
  main(process.env.ALPHA_VANTAGE_API_KEY).then(function (chart) {
    console.log(chart)
    process.exit(0)
  }, function (error) {
    console.error(error)
    process.exit(1)
  })
} else {
  module.exports = main
}
