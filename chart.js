const ChartJsImage = require('chartjs-to-image')
const axios = require('axios')

const api = axios.create({ baseURL: 'https://api.coingecko.com/api/v3' })

const formatData = (data) => {
  return data.map((el) => {
    return {
      t: el[0],
      y: el[1].toFixed(2),
    }
  })
}

let coinData = {}

const fetchData = async (coin) => {
  try {
    const [day, week, month, year, detail] = await Promise.all([
      api.get(`/coins/${coin}/market_chart/`, {
        params: {
          vs_currency: 'usd',
          days: '1',
        },
      }),
      api.get(`/coins/${coin}/market_chart/`, {
        params: {
          vs_currency: 'usd',
          days: '7',
        },
      }),
      api.get(`/coins/${coin}/market_chart/`, {
        params: {
          vs_currency: 'usd',
          days: '30',
        },
      }),
      api.get(`/coins/${coin}/market_chart/`, {
        params: {
          vs_currency: 'usd',
          days: '365',
        },
      }),
      api.get('/coins/markets/', {
        params: {
          vs_currency: 'usd',
          ids: `${coin}`,
        },
      }),
    ])

    coinData = {
      day: formatData(day.data.prices),
      week: formatData(week.data.prices),
      month: formatData(month.data.prices),
      year: formatData(year.data.prices),
      detail: detail.data,
    }
  } catch (err) {
    console.log(err.message)
  }
}

const historyOptions = {
  lineHeightAnnotation: {
    always: false,
    hover: false,
    lineWeight: 1.5,
  },

  animation: {
    duration: 2000,
  },
  maintainAspectRatio: false,
  responsive: true,
  scales: {
    xAxes: [
      {
        type: 'time',
        distribution: 'linear',
      },
    ],
  },
}

module.exports = makeChart = async (coin, period) => {
  await fetchData(coin)

  const { day, week, month, year, detail } = coinData

  switch (period) {
    case '24h':
      period = day
      break

    case '7d':
      period = week
      break

    case '1m':
      period = month
      break

    case '1y':
      period = year
      break

    default:
      period = day
      break
  }

  const myChart = new ChartJsImage()

  myChart.setConfig({
    type: 'line',
    data: {
      datasets: [
        {
          label: `${detail[0].name} price`,
          data: period,
          backgroundColor: 'rgba(0, 0, 255, 0.0)',
          borderColor: 'rgba(0, 0, 0, 0.8)',
          pointRadius: 0,
        },
      ],
    },
    options: {
      ...historyOptions,
    },
  })

  myChart.setWidth(1080)
  myChart.setHeight(720)

  return await myChart.getShortUrl()
}
