import React from 'react'
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Box,
  Text,
  Skeleton,
  Stack,
  HStack,
} from '@chakra-ui/react'
import { BoxCard, MoreInfoTooltip } from '@urbiport/ui'
import { VariableAnalytics, timeFilterLabels, timeFilterValues } from '../constants'

interface VariableConversionTableProps {
  analytics?: VariableAnalytics
  isLoading: boolean
  timeFilter: (typeof timeFilterValues)[number]
}

export const VariableConversionTable: React.FC<VariableConversionTableProps> = ({
  analytics,
  isLoading,
  timeFilter,
}) => {
  const timeFilterLabel = timeFilterLabels[timeFilter]

  if (isLoading) {
    return <Skeleton height="300px" />
  }

  if (!analytics) {
    return (
      <BoxCard>
        <Box p={8} textAlign="center">
          <Text color="text.light">
            No data available for the selected variable
          </Text>
        </Box>
      </BoxCard>
    )
  }

  const hasValues = analytics.valueStats.length > 0
  const hasEmpty = analytics.usersWithoutValue > 0

  return (
    <Stack spacing={4}>
      {hasValues && (
        <BoxCard>
          <Box overflowX="auto">
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>
                    <HStack spacing={1}>
                      <Text>{analytics.variableName}</Text>
                      <MoreInfoTooltip>
                        Different values that this variable can have
                      </MoreInfoTooltip>
                    </HStack>
                  </Th>
                  <Th isNumeric>
                    <HStack spacing={1} justifyContent="flex-end">
                      <Text>Started</Text>
                      <MoreInfoTooltip>
                        Number of users who started the bot and ended up with this value during {timeFilterLabel.toLowerCase()}
                      </MoreInfoTooltip>
                    </HStack>
                  </Th>
                  <Th isNumeric>
                    <HStack spacing={1} justifyContent="flex-end">
                      <Text>Completed</Text>
                      <MoreInfoTooltip>
                        Number of users who completed the entire bot flow during {timeFilterLabel.toLowerCase()}
                      </MoreInfoTooltip>
                    </HStack>
                  </Th>
                  <Th isNumeric>
                    <HStack spacing={1} justifyContent="flex-end">
                      <Text>Completion Rate</Text>
                      <MoreInfoTooltip>
                        Percentage of users with this value who completed the bot during {timeFilterLabel.toLowerCase()}
                      </MoreInfoTooltip>
                    </HStack>
                  </Th>
                  <Th isNumeric>
                    <HStack spacing={1} justifyContent="flex-end">
                      <Text>Drop-off Rate</Text>
                      <MoreInfoTooltip>
                        Percentage of users with this value who started but didn&apos;t complete the bot during {timeFilterLabel.toLowerCase()}
                      </MoreInfoTooltip>
                    </HStack>
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {analytics.valueStats.map((stat) => (
                  <Tr key={stat.value}>
                    <Td fontWeight="medium">{stat.value}</Td>
                    <Td isNumeric>{stat.totalStarts.toLocaleString()}</Td>
                    <Td isNumeric>{stat.totalCompleted.toLocaleString()}</Td>
                    <Td isNumeric>
                      <Text
                        color={
                          stat.completionRate >= 75 ? 'green.500' :
                            stat.completionRate >= 50 ? 'orange.500' :
                              'red.500'
                        }
                        fontWeight="semibold"
                      >
                        {stat.completionRate.toFixed(2)}%
                      </Text>
                    </Td>
                    <Td isNumeric>{stat.dropOffRate.toFixed(2)}%</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </BoxCard>
      )}


      {!hasValues && !hasEmpty && (
        <BoxCard>
          <Box p={8} textAlign="center">
            <Text color="text.light">
              No data available for the selected variable
            </Text>
          </Box>
        </BoxCard>
      )}
    </Stack>
  )
}
