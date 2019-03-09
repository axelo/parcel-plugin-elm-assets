const path = require("path");
const ElmAsset = require("parcel-bundler/src/assets/ElmAsset");
const addAssets = require("./addAssets");
const addSourceDirectory = require("./addSourceDirectory");

let nodeElmCompilerCompileToString;
let parcelAssetAddedToSourceDirectoriesVerified = false;

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
  }

  async process() {
    if (!this.options.isWarmUp) {
      return super.process();
    }
  }

  async getConfig(filenames, opts = {}) {
    if (
      !parcelAssetAddedToSourceDirectoriesVerified &&
      filenames[0] === "elm.json"
    ) {
      const elmConfigPath = await super.getConfig(filenames, { load: false });

      if (!elmConfigPath) {
        return super.getConfig(false, opts);
      }

      addSourceDirectory(elmConfigPath);

      parcelAssetAddedToSourceDirectoriesVerified = true;

      return elmConfigPath;
    }

    return super.getConfig(filenames, opts);
  }

  async transform() {
    if (!nodeElmCompilerCompileToString) {
      nodeElmCompilerCompileToString = this.elm.compileToString;
    }

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

    let compiledJs = await nodeElmCompilerCompileToString(name, {
      ...elmOpts,
      debug: false
    });

    return addAssets(
      url => this.addURLDependency(url),
      this.options.publicURL,
      elmOpts.optimize,
      compiledJs
    );
  }
}

module.exports = ElmAssetsAsset;
