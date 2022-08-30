@description('Name of the Key Vault (globally unique, 3-24 alphanumeric/hyphen chars).')
param keyVaultName string

param location string = resourceGroup().location

@description('Tenant ID for the Key Vault.')
param tenantId string = subscription().tenantId

resource keyVault 'Microsoft.KeyVault/vaults@2023-07-01' = {
  name: keyVaultName
  location: location
  properties: {
    sku: {
      family: 'A'
      name: 'standard'
    }
    tenantId: tenantId
    // RBAC (not access-policy) authorization — grant "Key Vault Secrets
    // User"/"Key Vault Secrets Officer" via role assignments in main.bicep
    // rather than vault-level access policies.
    enableRbacAuthorization: true
    enableSoftDelete: true
    softDeleteRetentionInDays: 90
    enablePurgeProtection: true
  }
}

output keyVaultName string = keyVault.name
output keyVaultUri string = keyVault.properties.vaultUri
output keyVaultId string = keyVault.id
