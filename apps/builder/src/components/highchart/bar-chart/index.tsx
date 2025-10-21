import React from 'react'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'

import { theme } from './theme'

export type BarChartProps = {
  options: Highcharts.Options
}

export const BarChart: React.FC<BarChartProps> = ({ options }) => {
  const customOptions: Highcharts.Options = {
    colors: theme.colors,
    credits: { enabled: false },
    ...options,
  }

  return <HighchartsReact highcharts={Highcharts} options={customOptions} />
}
