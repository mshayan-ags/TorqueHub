const { BlobServiceClient } = require('@azure/storage-blob');
const { CheckAllRequiredFieldsAvailaible } = require("./functions");
const { parseSecretIdentifier, getSecretClient } = require("./azureSecrets");

const secretIdentifier = process.env.STORAGE_SECRET_IDENTIFIER;
const containerName = 'uploads';

const ALLOWED_IMAGE_MIME_TYPES = new Set(
  (process.env.UPLOAD_ALLOWED_MIME_TYPES || "image/jpeg,image/png,image/webp,image/gif,image/svg+xml")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
);
const MAX_UPLOAD_BYTES = Number(process.env.UPLOAD_MAX_BYTES) || 5 * 1024 * 1024;

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
        const { vaultUrl, secretName, secretVersion } = parseSecretIdentifier(secretIdentifier);
        const secretOptions = secretVersion ? { version: secretVersion } : undefined;
        const secretResponse = await getSecretClient(vaultUrl).getSecret(secretName, secretOptions);
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

    if (!ALLOWED_IMAGE_MIME_TYPES.has(imageData?.type)) {
      return { Error: `Unsupported image type: ${imageData?.type}` };
    }

    const filename = `${Date.now()}-${Math.random().toString(32).substr(7, 5)}-${imageData?.name}`;

    const base64Data = imageData?.data.split("base64,")[1];

    const imageBuffer = Buffer.from(base64Data, 'base64');

    if (imageBuffer.length > MAX_UPLOAD_BYTES) {
      return { Error: `Image exceeds the ${Math.round(MAX_UPLOAD_BYTES / (1024 * 1024))}MB limit` };
    }

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

