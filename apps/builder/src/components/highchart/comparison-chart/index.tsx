import React from 'react'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'

import { theme } from './theme'

export interface ComparisonData {
  name: string
  current: number
  previous: number
}

export interface ComparisonMetric {
  name: string
  current: number
  previous: number
  trend?: number
}

export type ComparisonChartProps = {
  data: ComparisonData[]
  title?: string
  height?: number
}

export const ComparisonChart: React.FC<ComparisonChartProps> = ({
  data,
  title = 'Period Comparison',
  height = 300
}) => {
  const comparisonOptions: Highcharts.Options = {
    colors: theme.colors,
    chart: {
      type: 'column',
      height,
    },
    title: {
      text: title,
      style: {
        fontSize: '16px',
        fontWeight: 'bold',
      },
    },
    xAxis: {
      categories: data.map(item => item.name),
      crosshair: true,
    },
    yAxis: {
      min: 0,
      title: {
        text: 'Count',
      },
    },
    tooltip: {
      headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
      pointFormat:
        '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
        '<td style="padding:0"><b>{point.y}</b></td></tr>',
      footerFormat: '</table>',
      shared: true,
      useHTML: true,
    },
    plotOptions: {
      column: {
        pointPadding: 0.2,
        borderWidth: 0,
      },
    },
    legend: {
      enabled: true,
      align: 'center',
      verticalAlign: 'bottom',
    },
    credits: {
      enabled: false,
    },
    series: [
      {
        type: 'column',
        name: 'Current Period',
        data: data.map(item => item.current),
        color: theme.colors[0],
      },
      {
        type: 'column',
        name: 'Previous Period',
        data: data.map(item => item.previous),
        color: theme.colors[1],
      },
    ],
  }

  return <HighchartsReact highcharts={Highcharts} options={comparisonOptions} />
}