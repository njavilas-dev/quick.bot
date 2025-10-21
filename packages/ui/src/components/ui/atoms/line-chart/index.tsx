import React from 'react'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import { LineChartProps, theme } from './theme'

import './theme.scss'

export const LineChart: React.FC<LineChartProps> = (props) => {
  const options = {
    chart: {
      type: 'line',
    },
    title: {
      text: props.title ?? theme.title,
    },
    xAxis: {
      categories: props.categories ?? theme.categories,
    },
    yAxis: {
      title: {
        text: props.yTitle ?? theme.yTitle,
      },
    },
    series: props.data ?? theme.data,
  }

  return <HighchartsReact highcharts={Highcharts} options={options} />
}
