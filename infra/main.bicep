// TorqueHub — Azure infrastructure.
//
// Provisions the resources the app's code already knows how to talk to
// (Backend/Middlewares/Db.js, utils/saveImage.js, utils/mailer.js,
// utils/redisClient.js all resolve config via env vars or a Key-Vault
// secret identifier). This template does NOT deploy application code or
// populate any secret values — see infra/README.md for the deploy + secret
// -seeding steps that come after `az deployment group create`.
targetScope = 'resourceGroup'

@description('Short environment name, used in resource naming (e.g. dev, staging, prod).')
@allowed(['dev', 'staging', 'prod'])
param environmentName string = 'dev'

@description('Primary Azure region for most resources.')
param location string = resourceGroup().location

@description('Azure region for Static Web Apps (a smaller region list than most services).')
param staticWebAppLocation string = 'eastus2'

@description('Project name prefix used in resource naming.')
param projectName string = 'torquehub'

@description('Placeholder container image used on first deploy, before any real image has been pushed to the ACR created below. The backend-deploy.yml workflow overwrites this on every push via `az containerapp update`.')
param placeholderContainerImage string = 'mcr.microsoft.com/azuredocs/containerapps-helloworld:latest'

var uniqueSuffix = uniqueString(resourceGroup().id, environmentName)
var namePrefix = '${projectName}-${environmentName}'
// Storage/Cosmos/ACR/Key Vault/Communication Services names must be
// globally unique and (for storage/ACR) alphanumeric-only, so they get the
// uniqueString suffix baked in; human-scoped resources (Container Apps env,
// the app itself, Log Analytics, App Insights) just use namePrefix.
var globalSuffix = uniqueSuffix

module appInsightsModule 'modules/appInsights.bicep' = {
  name: 'appInsights-${environmentName}'
  params: {
    logAnalyticsName: take('${namePrefix}-logs', 63)
    appInsightsName: take('${namePrefix}-appi', 63)
    location: location
  }
}

module keyVaultModule 'modules/keyvault.bicep' = {
  name: 'keyVault-${environmentName}'
  params: {
    keyVaultName: take('${projectName}${environmentName}kv${globalSuffix}', 24)
    location: location
  }
}

module storageModule 'modules/storage.bicep' = {
  name: 'storage-${environmentName}'
  params: {
    storageAccountName: take(toLower('${projectName}${environmentName}st${globalSuffix}'), 24)
    location: location
  }
}

module cosmosModule 'modules/cosmosMongo.bicep' = {
  name: 'cosmos-${environmentName}'
  params: {
    cosmosAccountName: take(toLower('${namePrefix}-cosmos-${globalSuffix}'), 44)
    location: location
    databaseName: projectName
  }
}

module redisModule 'modules/redis.bicep' = {
  name: 'redis-${environmentName}'
  params: {
    redisName: take('${namePrefix}-redis-${globalSuffix}', 63)
    location: location
  }
}

module communicationModule 'modules/communicationServicesEmail.bicep' = {
  name: 'acsEmail-${environmentName}'
  params: {
    communicationServiceName: take('${namePrefix}-acs-${globalSuffix}', 63)
    emailServiceName: take('${namePrefix}-email-${globalSuffix}', 63)
  }
}

module registryModule 'modules/containerRegistry.bicep' = {
  name: 'acr-${environmentName}'
  params: {
    registryName: take(toLower('${projectName}${environmentName}acr${globalSuffix}'), 50)
    location: location
  }
}

// User-assigned identity the Backend Container App runs as: pulls from the
// ACR above and reads secrets from the Key Vault below, without any
// long-lived credential stored anywhere.
resource backendIdentity 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31' = {
  name: take('${namePrefix}-backend-id', 128)
  location: location
}

var keyVaultSecretsUserRoleId = '4633458b-17de-408a-b874-0445c86b69e6' // built-in "Key Vault Secrets User"
var acrPullRoleId = '7f951dda-4ed3-4680-a7ca-43fe172d538d' // built-in "AcrPull"

resource keyVaultRoleAssignment 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(keyVaultModule.outputs.keyVaultId, backendIdentity.id, keyVaultSecretsUserRoleId)
  scope: resourceGroup()
  properties: {
    principalId: backendIdentity.properties.principalId
    principalType: 'ServicePrincipal'
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', keyVaultSecretsUserRoleId)
  }
}

resource acrPullRoleAssignment 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(registryModule.outputs.registryId, backendIdentity.id, acrPullRoleId)
  scope: resourceGroup()
  properties: {
    principalId: backendIdentity.properties.principalId
    principalType: 'ServicePrincipal'
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', acrPullRoleId)
  }
}

// Non-secret env vars the container needs; secret-backed ones (Mongo,
// Stripe, Storage, ACS, Redis) are wired via Key Vault references below
// once you've run the `az keyvault secret set` steps in infra/README.md.
var backendPlainEnvVars = [
  { name: 'PORT', value: '5000' }
  { name: 'NODE_ENV', value: 'production' }
  { name: 'CORS_ALLOWED_ORIGINS', value: 'https://${namePrefix}-frontend.azurestaticapps.net,https://${namePrefix}-admin.azurestaticapps.net' }
  { name: 'ACS_EMAIL_SENDER_ADDRESS', value: 'DoNotReply@your-verified-domain.azurecomm.net' }
  { name: 'APPLICATIONINSIGHTS_CONNECTION_STRING', value: appInsightsModule.outputs.appInsightsConnectionString }
]

// Maps env var name -> Key Vault secret URI. Secrets referenced here must
// already exist in the vault (infra/README.md's post-deploy steps) or the
// Container App revision will fail to start — that's expected on the very
// first deploy, before any secrets have been seeded.
var backendKeyVaultSecretRefs = {
  JWT_SECRET: '${keyVaultModule.outputs.keyVaultUri}secrets/JWT-SECRET'
  MONGODB_URI: '${keyVaultModule.outputs.keyVaultUri}secrets/MONGODB-URI'
  STRIPE_SECRET_KEY: '${keyVaultModule.outputs.keyVaultUri}secrets/STRIPE-SECRET-KEY'
  STRIPE_WEBHOOK_SECRET: '${keyVaultModule.outputs.keyVaultUri}secrets/STRIPE-WEBHOOK-SECRET'
  AZURE_STORAGE_CONNECTION_STRING: '${keyVaultModule.outputs.keyVaultUri}secrets/STORAGE-CONNECTION-STRING'
  ACS_EMAIL_CONNECTION_STRING: '${keyVaultModule.outputs.keyVaultUri}secrets/ACS-EMAIL-CONNECTION-STRING'
  REDIS_CONNECTION_STRING: '${keyVaultModule.outputs.keyVaultUri}secrets/REDIS-CONNECTION-STRING'
}

module containerAppsModule 'modules/containerApps.bicep' = {
  name: 'containerApp-${environmentName}'
  params: {
    environmentName: take('${namePrefix}-env', 63)
    containerAppName: take('${namePrefix}-api', 63)
    location: location
    logAnalyticsWorkspaceId: appInsightsModule.outputs.logAnalyticsWorkspaceId
    acrLoginServer: registryModule.outputs.loginServer
    containerImage: placeholderContainerImage
    managedIdentityId: backendIdentity.id
    envVars: backendPlainEnvVars
    keyVaultSecretRefs: backendKeyVaultSecretRefs
  }
  dependsOn: [
    keyVaultRoleAssignment
    acrPullRoleAssignment
  ]
}

module frontendStaticWebAppModule 'modules/staticWebApp.bicep' = {
  name: 'frontendSwa-${environmentName}'
  params: {
    staticWebAppName: take('${namePrefix}-frontend', 40)
    location: staticWebAppLocation
    appLocation: '/Frontend'
  }
}

module adminStaticWebAppModule 'modules/staticWebApp.bicep' = {
  name: 'adminSwa-${environmentName}'
  params: {
    staticWebAppName: take('${namePrefix}-admin', 40)
    location: staticWebAppLocation
    appLocation: '/admin'
  }
}

output keyVaultName string = keyVaultModule.outputs.keyVaultName
output storageAccountName string = storageModule.outputs.storageAccountName
output cosmosAccountName string = cosmosModule.outputs.cosmosAccountName
output redisName string = redisModule.outputs.redisName
output communicationServiceName string = communicationModule.outputs.communicationServiceName
output containerRegistryLoginServer string = registryModule.outputs.loginServer
output backendIdentityPrincipalId string = backendIdentity.properties.principalId
output backendContainerAppFqdn string = containerAppsModule.outputs.containerAppFqdn
output frontendStaticWebAppHostname string = frontendStaticWebAppModule.outputs.staticWebAppDefaultHostname
output adminStaticWebAppHostname string = adminStaticWebAppModule.outputs.staticWebAppDefaultHostname
output appInsightsName string = appInsightsModule.outputs.appInsightsName
