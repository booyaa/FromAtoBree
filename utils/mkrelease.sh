VERSION=$1
node utils/build.js
rm ~/stage/fromatobree-web-v*.zip
zip -j ~/stage/fromatobree-web-$VERSION.zip dontcommitmebro/fromatobree-browser*.js
npm pack
mv fromatobree*.tgz ~/stage/
