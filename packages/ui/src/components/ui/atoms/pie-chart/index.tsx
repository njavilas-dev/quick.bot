import React from 'react'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import { PieChartProps, theme } from './theme'

import './theme.scss'

export const PieChart: React.FC<PieChartProps> = (props) => {
  const options = {
    chart: {
      type: 'pie',
    },
    title: {
      text: props.title ?? theme.title,
    },
    series: [
      {
        name: props.secondTitle ?? theme.secondTitle,
        colorByPoint: true,
        data: props.data ?? theme.data,
      },
    ],
  }

  return <HighchartsReact highcharts={Highcharts} options={options} />
}
