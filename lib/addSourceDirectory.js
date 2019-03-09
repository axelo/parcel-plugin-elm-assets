const fs = require("fs");
const logger = require("@parcel/logger");

module.exports = elmConfigPath => {
  const elmConfig = require(elmConfigPath);
  const sourceDirectories = elmConfig["source-directories"];
  const parcelAssetModuleSourceDirectory =
    "./node_modules/parcel-plugin-elm-assets/src";

  if (!sourceDirectories.includes(parcelAssetModuleSourceDirectory)) {
    sourceDirectories.push(parcelAssetModuleSourceDirectory);

    fs.writeFileSync(elmConfigPath, JSON.stringify(elmConfig, null, 4));

    logger.success(
      "elm.json updated with source-directory containing ParcelAsset module"
    );
  }
};
