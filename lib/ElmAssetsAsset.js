const path = require("path");
const ElmAsset = require("parcel-bundler/src/assets/ElmAsset");
const addAssets = require("./addAssets");
const addSourceDirectory = require("./addSourceDirectory");

let nodeElmCompilerCompileToString;
let parcelAssetAddedToSourceDirectoriesVerified = false;

// When dealing with multiple entrypoints Parcel will not honor
// the public url by default if they are located in different directories.
// We fix this by saying that all found bundles are in the same parent directory.
const setAllBundleNamesRelativeTo = (relativeDirname, bundleNameMap) => {
  const map = new Map();

  for (const [hash, name] of bundleNameMap.entries()) {
    map.set(hash, path.join(relativeDirname, path.basename(name)));
  }

  return map;
};

class ElmAssetsAsset extends ElmAsset {
  constructor(name, options) {
    super(name, options);

    this.elmConfigPath = undefined;
  }

  async process() {
    if (!this.options.isWarmUp) {
      return super.process();
    }
  }

  async getConfig(filenames, opts = {}) {
    if (filenames[0] === "elm.json") {
      const elmConfigPath = await super.getConfig(filenames, opts);

      this.elmConfigPath = elmConfigPath;

      if (!parcelAssetAddedToSourceDirectoriesVerified && elmConfigPath) {
        addSourceDirectory(elmConfigPath);

        parcelAssetAddedToSourceDirectoriesVerified = true;

        return elmConfigPath;
      }
    }

    return super.getConfig(filenames, opts);
  }

  async transform() {
    if (!nodeElmCompilerCompileToString) {
      // Store original elm.compileToString function
      nodeElmCompilerCompileToString = this.elm.compileToString;
    }

    // Take over elm.compileToString so we can look at the output before
    // returning it to ElmAsset
    this.elm = { compileToString: this.compileAndAddAssets.bind(this) };

    super.transform();
  }

  replaceBundleNames(bundleNameMap) {
    super.replaceBundleNames(
      setAllBundleNamesRelativeTo(
        path.dirname(this.relativeName),
        bundleNameMap
      )
    );
  }

  generateErrorMessage(err) {
    return err;
  }

  async compileAndAddAssets(name, elmOpts) {
    if (!nodeElmCompilerCompileToString) {
      throw new Error("Missing node-elm-compiler");
    }

    if (!this.elmConfigPath) {
      throw new Error("Missing path to elm.json");
    }

    let compiledJs = await nodeElmCompilerCompileToString(name, {
      ...elmOpts,
      debug: false
    });

    return addAssets(
      url => this.addURLDependency(url, this.elmConfigPath),
      this.options.publicURL,
      elmOpts.optimize,
      compiledJs
    );
  }
}

module.exports = ElmAssetsAsset;
