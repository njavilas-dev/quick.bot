#!/bin/bash

# Verificar que SCOPE esté definido
if [ -z "$SCOPE" ]; then
    echo "Error: La variable SCOPE no está definida"
    exit 1
fi

# Verificar que el archivo server.js existe
if [ ! -f "/app/apps/$SCOPE/server.js" ]; then
    echo "Error: No se encontró /app/apps/$SCOPE/server.js"
    exit 1
fi

echo "Iniciando aplicación: $SCOPE"
exec node "apps/$SCOPE/server.js" 