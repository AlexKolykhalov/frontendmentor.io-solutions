import { Namer } from '@parcel/plugin';
import path      from 'path';

export default new Namer({
  name({bundle}) {
    const name = path.basename(bundle.getMainEntry().filePath, `.${bundle.type}`);
    if (bundle.type === "woff2")
      return `public/fonts/${name}.${bundle.type}`;
    if (bundle.type === "css")
      return bundle.needsStableName ?
      `public/css/${name}.${bundle.type}`:
      `public/css/${name}.${bundle.hashReference}.${bundle.type}`;
    if (bundle.type === "js") 
      return bundle.needsStableName ?
      `${name}.${bundle.type}`:
      `public/js/${name}.${bundle.hashReference}.${bundle.type}`;

    return null;
  }
});
