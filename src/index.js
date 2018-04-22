import Plugin from 'uppy/lib/core/Plugin'
import {settle} from 'uppy/lib/core/Utils'
import * as qiniu from 'qiniu-js'
export default class Qiniu extends Plugin {
  constructor (uppy, opts) {
    super(uppy, opts)
    this.id = 'Qiniu'
    this.type = 'uploader'
    this.getToken = opts.getToken || (() => {})
    this.host = opts.host || ''
    this.useKeyName = opts.useKeyName || false
    this.Uploader = this.Uploader.bind(this)
  }
  uploadFiles (files) {
    const me = this
    const promises = files.map(file => {
      return new Promise((resolve, reject) => {
        const fileName = this.useKeyName ? null : file.name
        const observable = qiniu.upload(file.data, fileName, this.getToken())
        const observer = {
          next (res) {
            me.uppy.emit('upload-progress', file, {
              uploader: me,
              bytesUploaded: res.total.loaded,
              bytesTotal: res.total.size
            })
          },
          error (err) {
            me.uppy.emit('upload-error', file, err)
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
    return settle(promises)
  }
  Uploader (fileIDs) {
    const files = fileIDs.map(fileID => this.uppy.getFile(fileID))
    return this.uploadFiles(files)
  }
  install () {
    this.uppy.addUploader(this.Uploader)
  }
  uninstall () {
    this.uppy.removeUploader(this.Uploader)
  }
}
