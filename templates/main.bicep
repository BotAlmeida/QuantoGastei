param location string = resourceGroup().location
param appServicePlanName string = 'asp-despesas'
param backendWebAppName string = 'backend-webapp-despesas'
param frontendWebAppName string = 'frontend-webapp-despesas'
param storageAccountName string = 'despesasstorage'
param cosmosDbAccountName string = 'despesascosmos'

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
      linuxFxVersion: 'DOCKER|botalmeida/backend-despesas:latest'
      appSettings: [
        {
          name: 'WEBSITES_PORT'
          value: '80'
        }
        {
          name: 'BLOB_CONN_STRING'
          value: storageAccount.properties.primaryEndpoints.blob
        }
        {
          name: 'COSMOS_URL'
          value: cosmosDb.properties.documentEndpoint
        }
      ]
    }
  }
}

resource frontendWebApp 'Microsoft.Web/sites@2022-09-01' = {
  name: frontendWebAppName
  location: location
  kind: 'app,linux,container'
  properties: {
    serverFarmId: appServicePlan.id
    siteConfig: {
      linuxFxVersion: 'DOCKER|botalmeida/frontend-despesas:latest'
      appSettings: [
        {
          name: 'WEBSITES_PORT'
          value: '80'
        }
      ]
    }
  }
}
