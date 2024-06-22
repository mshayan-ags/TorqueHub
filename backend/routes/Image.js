const { Image } = require("../models/Image");
const { saveImage } = require("../utils/saveImage");
const { Router } = require("express");

async function SaveImageDB(image, rest, res) {
  try {
    const fileSaved = await saveImage(image, res);

    if (fileSaved?.filename) {
      const newImage = new Image({
        filename: fileSaved?.filename,
        mimetype: fileSaved?.mimetype,
        blobUrl: fileSaved?.blobUrl,           
        blobName: fileSaved?.blobName,         
        containerName: fileSaved?.containerName, 
        ...rest,
      });

      const savedImage = await newImage.save(); 

      return { file: savedImage };
    } else {
      return { Error: fileSaved?.Error };
    }
  } catch (error) {
    return { Error: error };
  }
}

const router = Router();

// Browsers refuse to follow an HTTP redirect whose Location is a data: URI
// ("unsafe redirect"), so a data: blobUrl (used for locally-seeded demo
// images, since they have no real blob storage backing them) must be
// decoded and served directly rather than redirected to. A real
// http(s) blobUrl (production Azure Blob Storage) is still redirected to
// as before.
function respondWithImage(res, imageRecord) {
  if (!imageRecord?.blobUrl) {
    return res.status(404).json({ status: 404, message: "Image Not Found" });
  }

  const dataUriMatch = /^data:([^;]+);base64,(.+)$/.exec(imageRecord.blobUrl);
  if (dataUriMatch) {
    const [, mimetype, base64Data] = dataUriMatch;
    res.set("Content-Type", mimetype);
    return res.send(Buffer.from(base64Data, "base64"));
  }

  return res.redirect(imageRecord.blobUrl);
}

router.get("/GetImage/:filename", async (req, res) => {
  try {
    const imageRecord = await Image.findOne({ filename: req?.params?.filename });
    respondWithImage(res, imageRecord);
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: 500, message: error.message });
  }
});

router.get("/GetImageById/:id", async (req, res) => {
  try {
    const imageRecord = await Image.findOne({ _id: req.params.id });
    respondWithImage(res, imageRecord);
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: 500, message: error.message });
  }
});

module.exports = { SaveImageDB, GetImage: router };
