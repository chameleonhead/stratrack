@description('The location for all resources.')
param location string = resourceGroup().location

@description('Name of the log analytics workspace')
param logAnalyticsName string

@description('Name of application insights')
param applicationInsightsName string

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

resource logAnalytics 'Microsoft.OperationalInsights/workspaces@2023-09-01' = {
  name: logAnalyticsName
  location: location
  properties: any({
    retentionInDays: 30
    features: {
      searchVersion: 1
    }
    sku: {
      name: 'PerGB2018'
    }
  })
}

resource applicationInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: applicationInsightsName
  location: location
  kind: 'web'
  properties: {
    Application_Type: 'web'
    WorkspaceResourceId: logAnalytics.id
  }
}

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
      windowsFxVersion: 'DOTNETCORE|8.0'
      appSettings: [
        {
          name: 'FUNCTIONS_EXTENSION_VERSION'
          value: '~4'
        }
        {
          name: 'FUNCTIONS_WORKER_RUNTIME'
          value: 'dotnet-isolated'
        }
        {
          name: 'AzureWebJobsStorage'
          value: 'DefaultEndpointsProtocol=https;AccountName=${storageAccountName};AccountKey=${listKeys(storageAccountName, storageAccount.apiVersion).keys[0].value}'
        }
        {
          name: 'APPLICATIONINSIGHTS_CONNECTION_STRING'
          value: applicationInsights.properties.ConnectionString
        }
      ]
      connectionStrings: [
        {
          name: 'SqlConnectionString'
          connectionString: 'Server=tcp:${sqlServer.properties.fullyQualifiedDomainName},1433;Initial Catalog=${sqlDatabaseName};Persist Security Info=False;User ID=${sqlAdminUser};Password=${sqlAdminPassword};MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;'
          type: 'SQLAzure'
        }
      ]
    }
  }
}
