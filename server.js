const express = require('express')
const app = express()

const makeChart = require('./chart')

app.get('/:coin/:period', async (req, res) => {
  const coin = req.params['coin']
  const period = req.params['period']

  const chartUrl = await makeChart(coin, period)

  res.send(chartUrl)
})

app.listen(3000, () => console.log('listening on port 3000'))
