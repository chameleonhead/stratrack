@description('The location for all resources.')
param location string = resourceGroup().location

@description('Name of the storage account')
param storageAccountName string

@description('Name of the SQL server')
param sqlServerName string

@secure()
@description('SQL administrator login')
param sqlAdminUser string

@secure()
@description('SQL administrator password')
param sqlAdminPassword string

@description('Name of the SQL database')
param sqlDatabaseName string

@description('Name of the Function App')
param functionAppName string

@description('Name of the Static Web App')
param staticWebAppName string

resource storageAccount 'Microsoft.Storage/storageAccounts@2023-05-01' = {
  name: storageAccountName
  location: resourceGroup().location
  kind: 'StorageV2'
  sku: {
    name: 'Standard_LRS'
  }
}

resource sqlServer 'Microsoft.Sql/servers@2024-05-01-preview' = {
  name: sqlServerName
  location: location
  properties: {
    administratorLogin: sqlAdminUser
    administratorLoginPassword: sqlAdminPassword
  }
}

resource sqlDatabase 'Microsoft.Sql/servers/databases@2024-05-01-preview' = {
  parent: sqlServer
  name: sqlDatabaseName
  location: resourceGroup().location
  // Basic (DTU = 5)
  // sku: {
  //   name: 'Basic'
  //   tier: 'Basic'
  // }
  // Serverless
  sku: {
    name: 'GP_S_Gen5'
    tier: 'GeneralPurpose'
    family: 'Gen5'
    capacity: 1
  }
  properties: {
    autoPauseDelay: 60
    maxSizeBytes: 1073741824
    minCapacity: json('0.5')
    requestedBackupStorageRedundancy: 'Local'
  }
}

resource staticWebApp 'Microsoft.Web/staticSites@2022-03-01' = {
  name: staticWebAppName
  location: 'eastasia'
  sku: {
    name: 'Free'
    tier: 'Free'
  }
  properties: {
    // repositoryUrl: 'https://github.com/cha/repo' // あとでGitHub連携を設定
    // branch: 'main'
    // buildProperties: {
    //   appLocation: 'frontend'
    //   apiLocation: 'api'
    //   outputLocation: 'dist'
    // }
  }
}

resource functionAppPlan 'Microsoft.Web/serverfarms@2024-04-01' = {
  name: '${functionAppName}-plan'
  location: location
  // 日本リージョンでは使えない
  // sku: {
  //   tier: 'FlexConsumption'
  //   name: 'FC1'
  // }
  sku: {
    tier: 'Dynamic'
    name: 'Y1'
  }
}

resource functionApp 'Microsoft.Web/sites@2024-04-01' = {
  name: functionAppName
  location: location
  kind: 'functionapp'
  properties: {
    serverFarmId: functionAppPlan.id
    httpsOnly: true
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
