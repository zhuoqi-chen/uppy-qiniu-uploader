# uppy-qiniu-uploader
> uppy qiniu uploader plugin

## install
```js
npm i uppy-qiniu-uploader -S
```

## Getting Started
```html
<div id="select-files"></div>
```
```js
import "uppy/dist/uppy.css";
import Uppy from "uppy/lib/core";
import Dashboard from "uppy/lib/plugins/Dashboard";
import Qiniu from "uppy-qiniu-uploader";
const uppy = Uppy({
    autoProceed: false
    })
    .use(Dashboard, {
        target: "#select-files",
        inline: true,
        proudlyDisplayPoweredByUppy: false
    })
    .use(Qiniu, {
        host: "http://p7fl7t6sj.bkt.clouddn.com",
        getToken() {
            // return qiniu upload token
        }
    })
    .run();
uppy.on("complete", result => {
        console.log(`Upload complete! We’ve uploaded these files: `, result);
    });
```

## Options
### host{(String)}

root URL of link uploaded file 
### getToken{Function}
the method for get qiniu upload token
