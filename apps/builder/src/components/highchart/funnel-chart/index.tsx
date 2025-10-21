import React from 'react'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import HighchartsFunnel from 'highcharts/modules/funnel'

import { theme } from './theme'

if (typeof Highcharts === 'object') {
  HighchartsFunnel(Highcharts)
}

export interface FunnelData {
  name: string
  value: number
}

export type FunnelChartProps = {
  data: FunnelData[]
  title?: string
  showPercentages?: boolean
  height?: number
}

export const FunnelChart: React.FC<FunnelChartProps> = ({
  data,
  title = 'Conversion Funnel',
  showPercentages = true,
  height = 300
}) => {
  const funnelOptions: Highcharts.Options = {
    colors: theme.colors,
    chart: {
      type: 'funnel',
      height,
    },
    title: {
      text: title,
      style: {
        fontSize: '16px',
        fontWeight: 'bold',
      },
    },
    plotOptions: {
      funnel: {
        dataLabels: {
          enabled: true,
          format: showPercentages
            ? '<b>{point.name}</b><br>({point.y:,.0f})'
            : '<b>{point.name}</b> ({point.y:,.0f})',
          softConnector: true,
          style: {
            fontSize: '12px',
            fontWeight: 'normal',
          },
        },
        center: ['50%', '50%'],
        width: '85%',
        neckWidth: '10%',
        neckHeight: '10%',
      },
    },
    legend: {
      enabled: false,
    },
    credits: {
      enabled: false,
    },
    series: [
      {
        type: 'funnel',
        name: 'Conversion Funnel',
        data: data.map(item => [item.name, item.value]),
      },
    ],
  }

  return <HighchartsReact highcharts={Highcharts} options={funnelOptions} />
}