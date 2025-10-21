export interface PieChartProps {
  data: { name: string; y: number; color?: string }[]
  title?: string
  secondTitle?: string
}

export const theme: PieChartProps = {
  data: [
    { name: 'Chrome', y: 61.41 },
    { name: 'Edge', y: 11.84 },
    { name: 'Firefox', y: 10.85 },
    { name: 'Safari', y: 4.67 },
    { name: 'Other', y: 11.23 },
  ],
  title: 'Bar Chart',
  secondTitle: 'Values',
}
