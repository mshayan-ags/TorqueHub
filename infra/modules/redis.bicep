@description('Name of the Azure Cache for Redis instance (globally unique).')
param redisName string

param location string = resourceGroup().location

@description('Redis SKU family: C = Basic/Standard, P = Premium.')
param skuFamily string = 'C'

@description('Redis SKU name: Basic, Standard, or Premium.')
param skuName string = 'Basic'

@description('Redis SKU capacity/size (0 = 250MB on Basic/Standard).')
param skuCapacity int = 0

resource redisCache 'Microsoft.Cache/redis@2023-08-01' = {
  name: redisName
  location: location
  properties: {
    sku: {
      name: skuName
      family: skuFamily
      capacity: skuCapacity
    }
    enableNonSslPort: false
    minimumTlsVersion: '1.2'
  }
}

output redisName string = redisCache.name
output redisHostName string = redisCache.properties.hostName
output redisSslPort int = redisCache.properties.sslPort

// Deliberately not outputting the access key — fetch it out-of-band and
// push it into Key Vault as REDIS_CONNECTION_STRING (rediss://:<key>@<host>:<sslPort>):
//   az redis list-keys --name <name> --resource-group <rg>
