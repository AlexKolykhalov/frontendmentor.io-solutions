//@ts-check

import { Transformer } from '@parcel/plugin';

export default new Transformer({
  async transform({asset}) {    
    asset.setCode("ejs" + await asset.getCode());
    asset.type = "html";
    
    return [asset];
  }
});
