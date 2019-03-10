# parcel-plugin-elm-assets

Parcel plugin for bundling assets (images, svgs etc.) directly from Elm code.

Instead of having to require your assets from your entrypoints (.js/.ts) and pass the urls
down with flags to your Elm application you can instead directly from Elm code refer
to asset paths.

All assets will get bundled with Parcel the same way as if you had required it from JavaScript/TypeScript. Assets are content hashed and you will get a build error if any asset is missing at compile time.

## Installation

```
npm install --save-dev axelo/parcel-plugin-elm-assets#0.0.1
```

## Usage

During install the [src](./src/) directory is added to your applications `elm.json` as a `source-directory`. Adding the module [Parcel.Asset](./src/Parcel/Asset.elm) as a dependency.

From any Elm module import `Parcel.Asset` and call the function `fromPath` with a path to an asset.

```elm
import Parcel.Asset

viewStar : Html msg
viewStar = img [ src (Parcel.Asset.fromPath "../assets/star.png") ] []
```

## Under the hood

By finding calls to the function `fromPath` from the module `Parcel.Asset` we can examine the argument and use Parcels builtin `addURLDepdency` and then replace the argument with the hash string returned.

We find the calls by extending the default ElmAsset supplied by Parcel and examine the compiled javascript output during processing.

See [ElmAssetsAsset](./lib/ElmAssetsAsset.js)
