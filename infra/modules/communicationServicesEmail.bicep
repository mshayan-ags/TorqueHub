@description('Name of the Communication Services resource.')
param communicationServiceName string

@description('Name of the Email Communication Service resource.')
param emailServiceName string

@description('Data location for the Communication/Email Services resources.')
param dataLocation string = 'United States'

// Azure-managed domain — Azure auto-provisions and verifies a subdomain
// under *.azurecomm.net, no DNS records to manage. Swap to a custom domain
// (domainManagement: 'CustomerManaged') later if a branded "from" address
// is needed; that requires manual DNS verification outside Bicep.
resource emailService 'Microsoft.Communication/emailServices@2023-04-01' = {
  name: emailServiceName
  location: 'global'
  properties: {
    dataLocation: dataLocation
  }
}

resource domain 'Microsoft.Communication/emailServices/domains@2023-04-01' = {
  parent: emailService
  name: 'AzureManagedDomain'
  location: 'global'
  properties: {
    domainManagement: 'AzureManaged'
  }
}

resource communicationService 'Microsoft.Communication/communicationServices@2023-04-01' = {
  name: communicationServiceName
  location: 'global'
  properties: {
    dataLocation: dataLocation
    linkedDomains: [
      domain.id
    ]
  }
}

output communicationServiceName string = communicationService.name
output emailDomainResourceName string = domain.name

// Deliberately not outputting the connection string or the auto-generated
// sender address — both need to be read after the Azure-managed domain
// finishes provisioning (can take a few minutes) and pushed into Key Vault:
//   az communication list-key --name <communicationServiceName> --resource-group <rg>
//   az communication email domain show --domain-name AzureManagedDomain --email-service-name <emailServiceName> --resource-group <rg> --query mailFromSenderDomain
// Set ACS_EMAIL_SENDER_ADDRESS to DoNotReply@<that domain>.
