@description('Name of the storage account (globally unique, 3-24 lowercase alphanumeric).')
param storageAccountName string

param location string = resourceGroup().location

@description('Name of the blob container used for product/blog images (backend/utils/saveImage.js expects "uploads").')
param containerName string = 'uploads'

resource storageAccount 'Microsoft.Storage/storageAccounts@2023-01-01' = {
  name: storageAccountName
  location: location
  sku: {
    name: 'Standard_LRS'
  }
  kind: 'StorageV2'
  properties: {
    minimumTlsVersion: 'TLS1_2'
    // Product/blog images are served directly to two public frontend
    // origins today — matches the existing app's serving model
    // (backend/routes/Image.js redirects to the blob URL for non-data-URI
    // images). Tighten to false + a CDN/Front Door origin if that changes.
    allowBlobPublicAccess: true
    supportsHttpsTrafficOnly: true
  }
}

resource blobService 'Microsoft.Storage/storageAccounts/blobServices@2023-01-01' = {
  parent: storageAccount
  name: 'default'
}

resource container 'Microsoft.Storage/storageAccounts/blobServices/containers@2023-01-01' = {
  parent: blobService
  name: containerName
  properties: {
    publicAccess: 'Blob'
  }
}

output storageAccountName string = storageAccount.name
output storageAccountId string = storageAccount.id

// Deliberately not outputting the connection string here — Bicep outputs
// land in deployment history/logs. Fetch it out-of-band and push it into
// Key Vault instead:
//   az storage account show-connection-string --name <name> --resource-group <rg> --query connectionString -o tsv
