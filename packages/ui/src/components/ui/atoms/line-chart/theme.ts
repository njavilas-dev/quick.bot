export interface LineChartProps {
  data: { name: string; data: number[]; color?: string }[]
  title?: string
  yTitle?: string
  categories?: string[]
}

export const theme: LineChartProps = {
  data: [],
  title: 'Line Chart',
  yTitle: 'Values',
  categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
}
