param location string = resourceGroup().location
param appServicePlanName string = 'asp-despesas'
param webAppName string = 'webapp-despesas'
param storageAccountName string = 'despesasstorage'
param cosmosDbAccountName string = 'despesa-cosmos'
param functionAppName string = 'func-despesas'

resource storageAccount 'Microsoft.Storage/storageAccounts@2022-09-01' = {
  name: storageAccountName
  location: location
  sku: {
    name: 'Standard_LRS'
  }
  kind: 'StorageV2'
  properties: {}
}

resource blobContainer 'Microsoft.Storage/storageAccounts/blobServices/containers@2022-09-01' = {
  parent: storageAccount
  name: 'faturas'
  properties: {
    publicAccess: 'None'
  }
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

resource cosmosDbDb 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases@2023-03-15' = {
  parent: cosmosDb
  name: 'DespesasDB'
  properties: {
    resource: {
      id: 'DespesasDB'
    }
  }
}

resource cosmosDbContainer 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers@2023-03-15' = {
  parent: cosmosDbDb
  name: 'Registos'
  properties: {
    resource: {
      id: 'Registos'
      partitionKey: {
        paths: ['/id']
        kind: 'Hash'
      }
    }
  }
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

resource webApp 'Microsoft.Web/sites@2022-09-01' = {
  name: webAppName
  location: location
  kind: 'app,linux,container'
  properties: {
    serverFarmId: appServicePlan.id
    siteConfig: {
      linuxFxVersion: 'DOCKER|<imagem-docker>'
      appSettings: [
        {
          name: 'WEBSITES_PORT'
          value: '80'
        },
        {
          name: 'BLOB_CONN_STRING'
          value: storageAccount.properties.primaryEndpoints.blob
        },
        {
          name: 'COSMOS_URL'
          value: cosmosDb.properties.documentEndpoint
        }
      ]
    }
  }
}

resource functionApp 'Microsoft.Web/sites@2022-09-01' = {
  name: functionAppName
  location: location
  kind: 'functionapp'
  properties: {
    serverFarmId: appServicePlan.id
    siteConfig: {
      appSettings: [
        {
          name: 'AzureWebJobsStorage'
          value: storageAccount.properties.primaryEndpoints.blob
        }
      ]
    }
  }
}