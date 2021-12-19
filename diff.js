function sameVnode(a, b) {
    if(a.s===b.s) {
        return true
    }
}


var oldVnode = [{s:'A'},{s:'B'},{s:'C'}]

var newVnode = [{s:'B'},{s:'C'},{s:'E'},{s:'A'}]
