# TorqueHub — Infrastructure as Code

Bicep templates that provision the Azure resources the application code already
knows how to talk to (see `Backend/Middlewares/Db.js`, `Backend/utils/saveImage.js`,
`Backend/utils/mailer.js`, `Backend/utils/redisClient.js` — each resolves its
config from a direct env var or a Key Vault secret identifier).

**These templates have not been deployed or `az bicep build`-validated** — this
environment has no Azure CLI available. Review them and run a `what-if` before
a real deployment.

## What gets created

| Module | Resource |
|---|---|
| `modules/keyvault.bicep` | Key Vault (RBAC-authorized) |
| `modules/storage.bicep` | Storage Account + `uploads` blob container |
| `modules/cosmosMongo.bicep` | Cosmos DB for MongoDB API |
| `modules/redis.bicep` | Azure Cache for Redis (Basic, C0) |
| `modules/communicationServicesEmail.bicep` | Communication Services + an Azure-managed Email domain |
| `modules/appInsights.bicep` | Log Analytics workspace + Application Insights |
| `modules/containerRegistry.bicep` | Azure Container Registry (admin user disabled — pulled via managed identity) |
| `modules/containerApps.bicep` | Container Apps environment + the Backend API, running as a user-assigned managed identity |
| `modules/staticWebApp.bicep` | Static Web App (instantiated twice — Frontend and admin) |

`main.bicep` orchestrates all of the above, plus a user-assigned managed
identity for the Backend Container App with role assignments granting it
**Key Vault Secrets User** and **AcrPull** — no long-lived credentials are
stored anywhere.

## Deploying

```bash
az login
az group create --name torquehub-dev-rg --location eastus

az deployment group create \
  --resource-group torquehub-dev-rg \
  --template-file main.bicep \
  --parameters main.parameters.dev.json
```

Swap `main.parameters.dev.json` for `main.parameters.prod.json` (and a
separate resource group) for a second environment.

Sanity-check the plan first if you want:

```bash
az deployment group what-if \
  --resource-group torquehub-dev-rg \
  --template-file main.bicep \
  --parameters main.parameters.dev.json
```

## After the first deploy: seed secrets into Key Vault

The Container App references Key Vault secrets by name
(`JWT-SECRET`, `MONGODB-URI`, `STRIPE-SECRET-KEY`, `STRIPE-WEBHOOK-SECRET`,
`STORAGE-CONNECTION-STRING`, `ACS-EMAIL-CONNECTION-STRING`,
`REDIS-CONNECTION-STRING`) that **do not exist yet** right after
`main.bicep` runs — the Container App revision will fail to start until
they're populated. This is intentional: secret *values* never appear in a
Bicep template or deployment parameters file.

```bash
RG=torquehub-dev-rg
KV=<keyVaultName output from the deployment>

az keyvault secret set --vault-name $KV --name JWT-SECRET --value "$(openssl rand -hex 32)"

az keyvault secret set --vault-name $KV --name MONGODB-URI \
  --value "$(az cosmosdb keys list --name <cosmosAccountName> --resource-group $RG --type connection-strings --query 'connectionStrings[0].connectionString' -o tsv)"

az keyvault secret set --vault-name $KV --name STRIPE-SECRET-KEY --value "sk_live_..."
az keyvault secret set --vault-name $KV --name STRIPE-WEBHOOK-SECRET --value "whsec_..."

az keyvault secret set --vault-name $KV --name STORAGE-CONNECTION-STRING \
  --value "$(az storage account show-connection-string --name <storageAccountName> --resource-group $RG --query connectionString -o tsv)"

az keyvault secret set --vault-name $KV --name REDIS-CONNECTION-STRING \
  --value "rediss://:$(az redis list-keys --name <redisName> --resource-group $RG --query primaryKey -o tsv)@<redisHostName>:6380"

# The Azure-managed email domain takes a few minutes to finish provisioning
# and verifying before it has a connection string / sender address:
az keyvault secret set --vault-name $KV --name ACS-EMAIL-CONNECTION-STRING \
  --value "$(az communication list-key --name <communicationServiceName> --resource-group $RG --query primaryConnectionString -o tsv)"
```

Then restart the Container App revision (or trigger a new deployment via
`backend-deploy.yml`) so it picks the secrets up.

## SSO (optional)

`main.bicep` accepts `azureAdTenantId`/`azureAdAdminClientId` (admin staff
SSO) and `azureB2cTenantName`/`azureB2cTenantId`/`azureB2cPolicyName`/
`azureB2cClientId` (storefront SSO) parameters, wired straight through as
plain (non-secret) Container App env vars — they're the same IDs already
public in the admin/storefront SPA configs, not credentials. Leave them
unset to deploy with both SSO routes disabled; the password-based login
flows are unaffected either way.

## GitHub Actions secrets

The three workflows under `.github/workflows/` expect these repository
secrets:

| Secret | Used by | Value |
|---|---|---|
| `AZURE_REGISTRY_URL` | frontend-deploy, backend-deploy | ACR login server (`containerRegistryLoginServer` output) |
| `AZURE_REGISTRY_USERNAME` / `AZURE_REGISTRY_PASSWORD` | frontend-deploy, backend-deploy | Only needed if you enable the ACR admin user; prefer `azure/login` + a federated/OIDC credential instead for the backend workflow's `az containerapp update` step |
| `AZURE_CREDENTIALS` | backend-deploy | Service principal JSON for `azure/login` (`az ad sp create-for-rbac --sdk-auth`), scoped to this resource group |
| `AZURE_CONTAINER_APP_NAME` / `AZURE_RESOURCE_GROUP` | backend-deploy | Names to target with `az containerapp update` |
| `AZURE_ADMIN_SWA_TOKEN` | admin-deploy | `az staticwebapp secrets list --name <adminStaticWebAppName> --resource-group $RG --query properties.apiKey -o tsv` |

## Local dev — no Azure needed

`Backend/docker-compose.yml` now also runs a local `mongo:7` container, so
`docker compose up --build` from `Backend/` gives you the full API + database
without touching Azure at all. Point `MONGODB_URI` in `.env.docker` at
`mongodb://mongo:27017/torquehub` to use it.
