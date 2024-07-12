const { BlobServiceClient } = require('@azure/storage-blob');
const { SecretClient } = require('@azure/keyvault-secrets');
const { DefaultAzureCredential } = require('@azure/identity');
const { CheckAllRequiredFieldsAvailaible } = require("./functions");

const secretIdentifier = process.env.STORAGE_SECRET_IDENTIFIER;
const containerName = 'uploads';

function parseSecretIdentifier(secretUrl) {
  if (!secretUrl) {
    throw new Error("Azure Key Vault secret identifier is not defined.");
  }

  const parsedUrl = new URL(secretUrl);
  const segments = parsedUrl.pathname.split('/').filter(Boolean);

  if (segments[0] !== 'secrets' || !segments[1]) {
    throw new Error("Invalid Azure Key Vault secret identifier.");
  }

  return {
    vaultUrl: `${parsedUrl.protocol}//${parsedUrl.host}`,
    secretName: segments[1],
    secretVersion: segments[2]
  };
}

let secretClient;

function getSecretClient() {
  if (!secretClient) {
    const { vaultUrl } = parseSecretIdentifier(secretIdentifier);
    secretClient = new SecretClient(vaultUrl, new DefaultAzureCredential());
  }
  return secretClient;
}

let containerClientPromise;
let cachedContainerClient;

async function getContainerClient() {
  if (cachedContainerClient) {
    return cachedContainerClient;
  }

  if (!containerClientPromise) {
    containerClientPromise = (async () => {
      let connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;

      if (!connectionString) {
        const { secretName, secretVersion } = parseSecretIdentifier(secretIdentifier);
        const secretOptions = secretVersion ? { version: secretVersion } : undefined;
        const secretResponse = await getSecretClient().getSecret(secretName, secretOptions);
        connectionString = secretResponse?.value;
      }

      if (!connectionString) {
        throw new Error("Azure Storage connection string secret has no value.");
      }

      const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
      cachedContainerClient = blobServiceClient.getContainerClient(containerName);
      return cachedContainerClient;
    })().catch(error => {
      containerClientPromise = undefined;
      throw error;
    });
  }

  return containerClientPromise;
}

async function saveImage(image, res) {
  try {
    const imageData = image;
    
    const Check = await CheckAllRequiredFieldsAvailaible(
      imageData,
      ["name", "data", "type"],
      res
    );
    
    if (Check) {
      return { Error: "There Was Some Issue" };
    }

    const filename = `${Date.now()}-${Math.random().toString(32).substr(7, 5)}-${imageData?.name}`;
    
    const base64Data = imageData?.data.split("base64,")[1];
    
    const imageBuffer = Buffer.from(base64Data, 'base64');

    const containerClient = await getContainerClient();
    const blockBlobClient = containerClient.getBlockBlobClient(filename);

    await blockBlobClient.uploadData(imageBuffer, {
      blobHTTPHeaders: {
        blobContentType: imageData?.type
      }
    });

    console.log(`✅ Image uploaded successfully: ${filename}`);

    return { 
      filename: filename,
      mimetype: imageData?.type,
      blobUrl: blockBlobClient.url,
      blobName: filename,
      containerName: containerName
    };
    
  } catch (error) {
    console.error("❌ Error uploading image to Azure Blob:", error);
    return { Error: "There Was Some Issue" };
  }
}

async function deleteImage(blobName) {
  try {
    const containerClient = await getContainerClient();
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    await blockBlobClient.delete();
    
    console.log(`✅ Blob deleted successfully: ${blobName}`);
    return { success: true, message: "Image deleted successfully" };
    
  } catch (error) {
    console.error("❌ Error deleting image from Azure Blob:", error);
    return { Error: "Failed to delete image" };
  }
}

async function getBlobUrl(blobName) {
  const containerClient = await getContainerClient();
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  return blockBlobClient.url;
}

module.exports = { saveImage, deleteImage, getBlobUrl };

