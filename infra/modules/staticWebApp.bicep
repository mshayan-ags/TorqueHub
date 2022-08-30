@description('Name of the Static Web App.')
param staticWebAppName string

@description('Azure region — Static Web Apps is only available in a handful of regions (e.g. eastus2, centralus, westus2, westeurope, eastasia).')
param location string = 'eastus2'

@description('SKU: Free or Standard.')
param sku string = 'Free'

@description('App location within the repo, e.g. "/Frontend" or "/admin".')
param appLocation string

@description('Build output directory relative to appLocation (CRA\'s default "build" for both apps).')
param outputLocation string = 'build'

resource staticWebApp 'Microsoft.Web/staticSites@2023-12-01' = {
  name: staticWebAppName
  location: location
  sku: {
    name: sku
    tier: sku
  }
  properties: {
    // No repositoryUrl/branch here on purpose — the GitHub Actions
    // workflows (.github/workflows/admin-deploy.yml) push builds directly
    // via the deployment token rather than Static Web Apps' own built-in
    // GitHub integration, so this resource doesn't need repo credentials.
    buildProperties: {
      appLocation: appLocation
      outputLocation: outputLocation
    }
  }
}

output staticWebAppName string = staticWebApp.name
output staticWebAppDefaultHostname string = staticWebApp.properties.defaultHostname

// Deliberately not outputting the deployment token here — fetch it
// out-of-band and store it as a GitHub Actions secret
// (AZURE_ADMIN_SWA_TOKEN / AZURE_FRONTEND_SWA_TOKEN), never in deployment
// output/logs:
//   az staticwebapp secrets list --name <name> --resource-group <rg> --query properties.apiKey
