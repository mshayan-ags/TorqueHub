@description('Name of the Cosmos DB account (globally unique, lowercase alphanumeric/hyphen).')
param cosmosAccountName string

param location string = resourceGroup().location

@description('Name of the Mongo database to create (matches MONGODB_URI\'s database segment, "torquehub").')
param databaseName string = 'torquehub'

resource cosmosAccount 'Microsoft.DocumentDB/databaseAccounts@2024-05-15' = {
  name: cosmosAccountName
  location: location
  kind: 'MongoDB'
  properties: {
    databaseAccountOfferType: 'Standard'
    locations: [
      {
        locationName: location
        failoverPriority: 0
        isZoneRedundant: false
      }
    ]
    apiProperties: {
      serverVersion: '4.2'
    }
    capabilities: [
      {
        name: 'EnableMongo'
      }
    ]
    consistencyPolicy: {
      defaultConsistencyLevel: 'Session'
    }
  }
}

resource mongoDatabase 'Microsoft.DocumentDB/databaseAccounts/mongodbDatabases@2024-05-15' = {
  parent: cosmosAccount
  name: databaseName
  properties: {
    resource: {
      id: databaseName
    }
  }
}

output cosmosAccountName string = cosmosAccount.name
output cosmosAccountId string = cosmosAccount.id

// Deliberately not outputting the connection string — fetch it out-of-band
// and push it into Key Vault (as MONGODB_URI, or resolve via
// COSMOS_SECRET_IDENTIFIER as the existing app already supports):
//   az cosmosdb keys list --name <name> --resource-group <rg> --type connection-strings
