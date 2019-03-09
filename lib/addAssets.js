const path = require("path");
const logger = require("@parcel/logger");

const evalPath = path => {
  try {
    return eval(path);
  } catch (err) {
    logger.warn(
      `Only pure strings can be used as asset paths, ignoring ${path}`
    );
    return null;
  }
};

module.exports = (addURLDependency, publicURL, isOptimizedJs, compiledJs) => {
  const addAsset = hash => path.join(publicURL, addURLDependency(hash));

  const find = /author\$project\$ParcelAsset\$fromPath\(('.*')\)/g;

  const replacer = (match, path) => {
    const evaluatedPath = evalPath(path);

    return evaluatedPath === null
      ? match
      : `author$project$ParcelAsset$fromPath('${addAsset(evaluatedPath)}')`;
  };

  return compiledJs.replace(find, replacer);
};
