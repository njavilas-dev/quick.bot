// Clases CSS predefinidas del sistema de diseño
// Centralizadas para fácil mantenimiento

export const themeClasses = {
  // Layouts base
  layouts: {
    viewerContainer: 'h-screen w-full',
    centeredLayout: 'h-screen flex items-center justify-center flex-col',
    errorLayout: 'h-screen flex items-center justify-center flex-col px-4',
  },

  // Tipografía
  typography: {
    errorTitle: 'font-bold text-3xl text-error-600',
    errorSubtitle: 'text-2xl text-center text-black',
    notFoundTitle: 'font-bold text-3xl text-black',
    notFoundSubtitle: 'text-lg text-black',
  },

  // Estados de componentes
  error: {
    container: 'h-screen flex items-center justify-center flex-col px-4',
    title: 'font-bold text-3xl text-error-600',
    subtitle: 'text-2xl text-center text-black',
  },

  notFound: {
    container: 'h-screen flex items-center justify-center flex-col',
    title: 'font-bold text-3xl text-black',
    subtitle: 'text-lg text-black',
  },

  viewer: {
    container: 'h-screen w-full',
  },
}

// Función helper para obtener background dinámico de bots
export const getBotBackgroundStyle = (backgroundType: string, backgroundColor?: string) => {
  switch (backgroundType) {
    case 'Color':
      return { backgroundColor: backgroundColor || '#ffffff' }
    case 'None':
      return { backgroundColor: undefined }
    case 'Image':
      return {}
    default:
      return { backgroundColor: '#ffffff' }
  }
}
