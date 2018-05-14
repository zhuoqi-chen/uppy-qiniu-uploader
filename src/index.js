import Plugin from "uppy/lib/core/Plugin";
import { settle, limitPromises } from "uppy/lib/core/Utils";
import * as qiniu from "qiniu-js";
function isPromise(e) {
  return !!e && typeof e.then == "function";
}
export default class Qiniu extends Plugin {
  constructor(uppy, opts) {
    super(uppy, opts);
    this.id = "Qiniu";
    this.type = "uploader";
    this.getToken = opts.getToken;
    this.host = opts.host || "";
    this.useKeyName = opts.useKeyName || false;
    this.limit = opts.limit || 1;
    this.Uploader = this.Uploader.bind(this);
    this.uploadToQiniu = this.uploadToQiniu.bind(this);
    this.limitRequests = limitPromises(this.limit);
  }
  /**
   * 将单个文件上传七牛
   * @param {*} file
   */
  uploadToQiniu(file) {
    const me = this;
    const fileName = this.useKeyName ? null : file.name;
    let token = this.getToken(fileName);
    if (!isPromise(token) && typeof token !== "string") {
      const err = new TypeError(
        "The getToken option must be a function and its return value must be String Or Promise"
      );
      console.error(err);
      throw err;
    }
    if (!isPromise(token)) {
      token = Promise.resolve(token);
    }
    return token.then(token => {
      return new Promise((resolve, reject) => {
        if (!token) {
          console.error("token is null or not defind");
        }
        const observable = qiniu.upload(file.data, fileName, token);
        const observer = {
          next(res) {
            me.uppy.emit("upload-progress", file, {
              uploader: me,
              bytesUploaded: res.total.loaded,
              bytesTotal: res.total.size
            });
          },
          error(err) {
            me.uppy.emit("upload-error", file, err);
            console.error(err);
            reject(err);
          },
          complete(res) {
            const qiniuKey = res.key || "";
            const qiniuHash = res.hash || null;
            Object.assign(file.meta, { qiniuKey, qiniuHash });
            me.uppy.emit("upload-success", file, res, me.host + "/" + qiniuKey);
            resolve();
          }
        };
        observable.subscribe(observer);
        me.uppy.emit("upload-started", file);
      });
    });
  }
  Uploader(fileIDs) {
    const files = fileIDs.map(fileID => this.uppy.getFile(fileID));
    const uploadToQiniu = this.limitRequests(this.uploadToQiniu);
    const promises = files.map(file => {
      return uploadToQiniu(file);
    });
    return settle(promises);
  }
  install() {
    this.uppy.addUploader(this.Uploader);
  }
  uninstall() {
    this.uppy.removeUploader(this.Uploader);
  }
}
