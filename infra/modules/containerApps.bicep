@description('Name of the Container Apps managed environment.')
param environmentName string

@description('Name of the Container App running the backend API.')
param containerAppName string

param location string = resourceGroup().location

@description('Log Analytics workspace resource ID, for the environment\'s log destination.')
param logAnalyticsWorkspaceId string

@description('Login server of the Azure Container Registry (e.g. myregistry.azurecr.io).')
param acrLoginServer string

@description('Container image to deploy, e.g. <acrLoginServer>/backend:latest.')
param containerImage string

@description('Resource ID of the user-assigned managed identity used for ACR pull + Key Vault reads.')
param managedIdentityId string

@description('Plain (non-secret) environment variables for the backend container.')
param envVars array = []

@description('Map of ENV_VAR_NAME -> Key Vault secret URI, exposed to the container as secretRef-backed env vars.')
param keyVaultSecretRefs object = {}

// Log Analytics' customerId/sharedKey are needed to wire appLogsConfiguration
// below; read them from the existing workspace resource rather than passing
// them as extra params.
resource existingWorkspace 'Microsoft.OperationalInsights/workspaces@2023-09-01' existing = {
  name: last(split(logAnalyticsWorkspaceId, '/'))
}

resource containerAppEnv 'Microsoft.App/managedEnvironments@2024-03-01' = {
  name: environmentName
  location: location
  properties: {
    appLogsConfiguration: {
      destination: 'log-analytics'
      logAnalyticsConfiguration: {
        customerId: existingWorkspace.properties.customerId
        sharedKey: existingWorkspace.listKeys().primarySharedKey
      }
    }
  }
}

var keyVaultSecretNames = [for key in items(keyVaultSecretRefs): toLower(replace(key.key, '_', '-'))]

resource containerApp 'Microsoft.App/containerApps@2024-03-01' = {
  name: containerAppName
  location: location
  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: {
      '${managedIdentityId}': {}
    }
  }
  properties: {
    managedEnvironmentId: containerAppEnv.id
    configuration: {
      ingress: {
        external: true
        targetPort: 5000
        transport: 'auto'
      }
      registries: [
        {
          server: acrLoginServer
          identity: managedIdentityId
        }
      ]
      secrets: [for (key, i) in items(keyVaultSecretRefs): {
        name: keyVaultSecretNames[i]
        keyVaultUrl: key.value
        identity: managedIdentityId
      }]
    }
    template: {
      containers: [
        {
          name: 'torquehub-api'
          image: containerImage
          env: concat(envVars, [for (key, i) in items(keyVaultSecretRefs): {
            name: key.key
            secretRef: keyVaultSecretNames[i]
          }])
          resources: {
            cpu: json('0.5')
            memory: '1Gi'
          }
        }
      ]
      scale: {
        minReplicas: 0
        maxReplicas: 3
      }
    }
  }
}

output containerAppFqdn string = containerApp.properties.configuration.ingress.fqdn
output containerAppName string = containerApp.name
