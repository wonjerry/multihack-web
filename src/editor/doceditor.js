/* globals Quill */

var EventEmitter = require('events').EventEmitter
var inherits = require('inherits')
var FileSystem = require('./../filesystem/filesystem')

inherits(DocEditor, EventEmitter)

function DocEditor(options) {
    var self = this
    if (!(self instanceof DocEditor)) return new DocEditor(options)

  options = options || {}
  self.title = options.title || 'no name'
  self.container = options.container || document.createElement("div")
  self.container.className = 'editor-view'
  self.bindedTab = null

    var textarea = options.textarea
    if (!textarea) {
        textarea = document.createElement("div")
        textarea.className = "view doc-editor"
        self.container.appendChild(textarea)
    }
    self.textarea = textarea
    self._quill = new Quill(self.textarea, {
        modules: {
            toolbar: [
                [{header: [1, 2, false]}],
                ['bold', 'italic', 'underline', 'strike'],
                [{'list': 'ordered'}, {'list': 'bullet'}],
                ['link', 'image', 'video', 'formula', 'code-block'],
                ['clean']
            ]
        },
        placeholder: 'Compose an epic...',
        theme: 'snow'
    })
    self.content = null
    self.remoteBinder = null
    self._remote = null
    self._workingFile = null
}

DocEditor.prototype.open = function (filePath, remote) {
    var self = this
    if(self.remoteBinder) {
        throw Error('y-richtext already binded!')
    }
    self._remote = remote
    self.remoteBinder = self._remote.yfs.get(filePath)
    self.remoteBinder.bindQuill(self._quill)
    self._workingFile = FileSystem.get(filePath)
}
DocEditor.prototype.close = function () {
    var self = this
    self.remoteBinder.unbindQuill(self._quill)
    self.remoteBinder = null
    self._workingFile = null
    //TODO: destroy
    self._quill.disable()
    delete self._quill
}

DocEditor.prototype.getWorkingFile = function () {
  var self = this
  return self._workingFile || {}
}
DocEditor.prototype.bindTab = function (tab) {
  var self = this
  self.bindedTab = tab
}
module.exports = DocEditor