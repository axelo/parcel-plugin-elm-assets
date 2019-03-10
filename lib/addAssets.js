const path = require("path");
const logger = require("@parcel/logger");

const elmFunctionName = "Parcel$Asset$fromPath";

const elmFunctionNameCallRegExp = new RegExp(
  elmFunctionName.replace(/\$/g, "\\$") + "\\(('.*')\\)",
  "g"
);

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
  const addAsset = url => path.join(publicURL, addURLDependency(url));

  const replacer = (match, path) => {
    const evaluatedPath = evalPath(path);

    return evaluatedPath === null
      ? match
      : `${elmFunctionName}('${addAsset(evaluatedPath)}')`;
  };

  return compiledJs.replace(elmFunctionNameCallRegExp, replacer);
};
