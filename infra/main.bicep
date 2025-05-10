param location string = 'northeurope'
param appServicePlanName string = 'asp-despesas'
param backendWebAppName string = 'backend-webapp-despesas'
param functionAppName string = 'frontend-function-despesas'
param containerRegistryName string = 'acrdespesas'
param storageAccountName string = 'despesasstorage'
param cosmosDbAccountName string = 'despesascosmos'
param cosmosDbDbName string = 'despesasdb'
param cosmosDbContainerName string = 'items'


resource containerRegistry 'Microsoft.ContainerRegistry/registries@2023-01-01-preview' = {
  name: containerRegistryName
  location: location
  sku: {
    name: 'Basic'
  }
  properties: {
    adminUserEnabled: true
  }
}

resource storageAccount 'Microsoft.Storage/storageAccounts@2022-09-01' = {
  name: storageAccountName
  location: location
  sku: {
    name: 'Standard_LRS'
  }
  kind: 'StorageV2'
}

resource cosmosDb 'Microsoft.DocumentDB/databaseAccounts@2023-03-15' = {
  name: cosmosDbAccountName
  location: location
  kind: 'GlobalDocumentDB'
  properties: {
    databaseAccountOfferType: 'Standard'
    locations: [
      {
        locationName: location
        failoverPriority: 0
      }
    ]
    consistencyPolicy: {
      defaultConsistencyLevel: 'Session'
    }
  }
}

resource cosmosDbDatabase 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases@2023-03-15' = {
  name: '${cosmosDb.name}/${cosmosDbDbName}'
  properties: {
    resource: {
      id: cosmosDbDbName
    }
  }
  dependsOn: [cosmosDb]
}

resource cosmosDbContainer 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers@2023-03-15' = {
  name: '${cosmosDb.name}/${cosmosDbDbName}/${cosmosDbContainerName}'
  properties: {
    resource: {
      id: cosmosDbContainerName
      partitionKey: {
        paths: ['/id']
        kind: 'Hash'
      }
    }
  }
  dependsOn: [cosmosDbDatabase]
}

resource appServicePlan 'Microsoft.Web/serverfarms@2022-09-01' = {
  name: appServicePlanName
  location: location
  sku: {
    name: 'B1'
    tier: 'Basic'
  }
  properties: {
    reserved: true
  }
}

resource backendWebApp 'Microsoft.Web/sites@2022-09-01' = {
  name: backendWebAppName
  location: location
  kind: 'app,linux,container'
  properties: {
    serverFarmId: appServicePlan.id
    siteConfig: {
      linuxFxVersion: 'DOCKER|acrdespesas.azurecr.io/backend-despesas:latest'
      appSettings: [
        {
          name: 'WEBSITES_PORT'
          value: '80'
        }
        {
          name: 'BLOB_CONN_STRING'
          value: storageAccount.listKeys().keys[0].value
        }
        {
          name: 'COSMOS_CONN_STRING'
          value: cosmosDb.listConnectionStrings().connectionStrings[0].connectionString
        }
      ]
    }
  }
  dependsOn: [containerRegistry, storageAccount, cosmosDb]
}

resource frontendFunction 'Microsoft.Web/sites@2022-09-01' = {
  name: functionAppName
  location: location
  kind: 'functionapp,linux'
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    serverFarmId: appServicePlan.id
    siteConfig: {
      linuxFxVersion: 'DOCKER|acrdespesas.azurecr.io/frontend-despesas:latest'
      appSettings: [
        {
          name: 'FUNCTIONS_WORKER_RUNTIME'
          value: 'node'
        }
        {
          name: 'AzureWebJobsStorage'
          value: storageAccount.listKeys().keys[0].value
        }
        {
          name: 'COSMOS_CONN_STRING'
          value: cosmosDb.listConnectionStrings().connectionStrings[0].connectionString
        }
      ]
    }
  }
  dependsOn: [containerRegistry, storageAccount, cosmosDb]
}

output registryLoginServer string = containerRegistry.properties.loginServer
output storageConnectionString string = storageAccount.listKeys().keys[0].value
output cosmosConnectionString string = cosmosDb.listConnectionStrings().connectionStrings[0].connectionString
