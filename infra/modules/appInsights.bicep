@description('Name of the Log Analytics workspace backing Application Insights.')
param logAnalyticsName string

@description('Name of the Application Insights resource.')
param appInsightsName string

param location string = resourceGroup().location

resource logAnalytics 'Microsoft.OperationalInsights/workspaces@2023-09-01' = {
  name: logAnalyticsName
  location: location
  properties: {
    sku: {
      name: 'PerGB2018'
    }
    retentionInDays: 30
  }
}

resource appInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: appInsightsName
  location: location
  kind: 'web'
  properties: {
    Application_Type: 'web'
    WorkspaceResourceId: logAnalytics.id
    IngestionMode: 'LogAnalytics'
  }
}

output appInsightsName string = appInsights.name
output logAnalyticsWorkspaceId string = logAnalytics.id
// App Insights connection strings are ingestion-only (no read access to
// telemetry), so — unlike the other modules — it's fine to output this
// directly for main.bicep to wire straight into the Container App's env.
output appInsightsConnectionString string = appInsights.properties.ConnectionString
