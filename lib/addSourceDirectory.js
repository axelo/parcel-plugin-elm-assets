const fs = require("fs");
const path = require("path");
const logger = require("@parcel/logger");

module.exports = elmConfigPath => {
  const elmConfig = require(elmConfigPath);
  const sourceDirectories = elmConfig["source-directories"];
  const parcelAssetModuleSourceDirectory = path.relative(
    path.dirname(elmConfigPath),
    path.join(__dirname, "../src")
  );

  if (!sourceDirectories.includes(parcelAssetModuleSourceDirectory)) {
    sourceDirectories.push(parcelAssetModuleSourceDirectory);

    fs.writeFileSync(elmConfigPath, JSON.stringify(elmConfig, null, 4));

    logger.success(
      "elm.json updated with source-directory containing ParcelAsset module"
    );
  }
};
