VERSION=$1
node utils/build.js
rm ~/stage/FromAtoBree-$VERSION.zip
zip -j ~/stage/FromAtoBree.zip dontcommitmebro/fromatobree-browser*.js
npm pack
mv fromatobree*.tgz ~/stage/
