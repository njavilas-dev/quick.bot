export class FlowManager {
  static parseFlowResponse(responseJson: string): {
    selectedOptions: string[]
    selectedTitles: string
    blockId?: string
  } {
    try {
      const response = JSON.parse(responseJson)
      return {
        selectedOptions: response.selected_options || [],
        selectedTitles: response.selected_titles || '',
        blockId: response.block_id,
      }
    } catch (error) {
      console.error('Error parsing flow response:', error)
      return {
        selectedOptions: [],
        selectedTitles: responseJson,
      }
    }
  }
}
