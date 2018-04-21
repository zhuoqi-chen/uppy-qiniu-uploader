import Plugin from 'uppy/lib/core/Plugin'
import * as qiniu from 'qiniu-js'
export default class Qiniu extends Plugin {
  constructor (uppy, opts) {
    super(uppy, opts)
    this.id = opts.id || 'Qiniu'
    this.type = 'uploader'
    this.getToken = opts.getToken || (() => {})
    this.host = opts.host || ''
    this.Uploader = this.Uploader.bind(this)
  }
  uploadFiles (files) {
    const me = this
    const filesPromise = files.map(file => {
      return new Promise((resolve, reject) => {
        const observable = qiniu.upload(file.data, file.name, this.getToken())
        const observer = {
          next (res) {
            me.uppy.emit('upload-progress', file, {
              uploader: me,
              bytesUploaded: res.total.loaded,
              bytesTotal: res.total.size
            })
          },
          error (err) {
            reject(err)
          },
          complete (res) {
            me.uppy.emit('upload-success', file, res, me.host + '/' + res.key)
            resolve()
          }
        }
        observable.subscribe(observer)
        me.uppy.emit('upload-started', file)
      })
    })
    return Promise.all(filesPromise)
  }
  Uploader (fileIDs) {
    const files = fileIDs.map(fileID => this.uppy.getFile(fileID))
    return this.uploadFiles(files)
  }
  install () {
    this.uppy.addUploader(this.Uploader)
  }
  uninstall () {
    this.uppy.removePreProcessor(this.prepareUpload)
  }
}
