@description('Name of the Azure Container Registry (globally unique, alphanumeric only, no hyphens).')
param registryName string

param location string = resourceGroup().location

@description('ACR SKU: Basic, Standard, or Premium.')
param sku string = 'Basic'

resource registry 'Microsoft.ContainerRegistry/registries@2023-11-01-preview' = {
  name: registryName
  location: location
  sku: {
    name: sku
  }
  properties: {
    adminUserEnabled: false // pulled via managed identity, not admin credentials
  }
}

output registryName string = registry.name
output loginServer string = registry.properties.loginServer
output registryId string = registry.id
