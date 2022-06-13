const loader_el = "<div id='pre-loader-block'><div class=\"pre-loader\"><div></div><div></div><div></div></div></div>";


function end_loader(timeout = 0) {
    var check_exist = $('#pre-loader-block').length
    if (check_exist > 0) {
        if (timeout > 0) {
            setTimeout(() => {
                $('#pre-loader-block').remove();
            }, timeout * 1000)
        } else {
            $('#pre-loader-block').remove();
        }
    }

}

function start_loader() {
    var check_exist = $('#pre-loader-block').length
    if (check_exist < 1) {
        $('body').append(loader_el)
    }
}
// Message Box initialization
window.alert_toast = function($type = '', $msg = "Message box conten", $delay = 3500) {
        $('#alert_toast').removeClass('bg-dark bg-success bg-warning bg-default bg-primary bg-secodary bg-danger bg-info')
        switch ($type) {
            case "success":
                $('#alert_toast').addClass('bg-success')
                $msg = "<i class='fa fa-check'></i> " + $msg;
                break;
            case "error":
                $('#alert_toast').addClass('bg-danger')
                $msg = "<i class='fa fa-exclamation-triangle'></i> " + $msg;
                break;
            case "warning":
                $('#alert_toast').addClass('bg-warning')
                $msg = "<i class='fa fa-exclamation-triangle'></i> " + $msg;
                break;
            case "info":
                $('#alert_toast').addClass('bg-info')
                $msg = "<i class='fa fa-exclamation-circle'></i> " + $msg;
                break;
        }
        $('#alert_toast').find('.toast-content').html($msg)
        if ($delay > 0) {
            $('#alert_toast').toast({ delay: $delay });
            $('#alert_toast').find("button").show()
        } else {
            $('#alert_toast').toast({ autohide: false })
            $('#alert_toast').find("button").hide()
        }
        $('#alert_toast').toast('show')
    }
    // Confirmation Box
window.confirm_toast = function($msg = "Are you sure to delete", $id = 0) {
    $('#confirm_toast').find('.toast-content').html($msg)
    $('#confirm_toast').find('#confirm_delete').attr('data-id', $id)
    $('#confirm_toast').toast({ autohide: false })
    $('#confirm_toast').toast('show')
}
window._search = function() {
    $('#search').on('input', function() {
        var keyword = $(this).val().toLowerCase()
        $('#note_list .note-item').each(function() {
            var txt = $(this).text().toLowerCase()
            if (txt.includes(keyword) == true) {
                $(this).toggle(true)
            } else {
                $(this).toggle(false)
            }
        })
    })
}
start_loader();
$(function() {
    var _load_data = new Promise((resolve, reject) => {
        if (load_notes()) {
            resolve()
        } else {
            reject()
        }
    })
    _load_data
        .then(() => {
            end_loader(0.5)
        })
        .catch(() => {
            alert_toast("error", "An error occured while loading the page. Please try to reload the page.")
            end_loader()
        })
        // alert toast on show function
    $('#alert_toast,#confirm_toast').on('show.bs.toast	', function() {
            $(this).parent().addClass('show')
            $(this).parent().removeClass('d-none')
        })
        // alert toast on hidden function
    $('#alert_toast,#confirm_toast').on('hidden.bs.toast	', function() {
            $(this).parent().removeClass('show')
            $(this).parent().addClass('d-none')
        })
        // auto saving Note
    $('[contenteditable="true"]').on('keyup', function() {
        if ($('#noteForm .card-tools>button:visible').length == 0) {
            $('#save,#reset').show()
        }
        if ($('#noteForm').attr('data-id') != '') {
            save_note();
        }
    })
    $('[contenteditable="true"]').on('focusout mousedown mouseup', function() {
            if ($('#noteForm').attr('data-id') != '') {
                save_note();
                load_notes_single($('#noteForm').attr('data-id'))
            }
        })
        //saving note
    $('#save,#update').click(function(e) {
        e.preventDefault()
        start_loader()
        if ($('[name="title"]').html() == '' && $('[name="note"]').html() == '') {
            end_loader();
            alert_toast('warning', " A note must have a content or title before saving.")
            return false;
        }
        var process = new Promise(function(resolve, reject) {
            if (save_note())
                resolve();
            else
                reject();
        })
        process
            .then(() => {
                load_notes_single($('#noteForm').attr('data-id'))
                form_reset();
            })
            .then(() => {
                end_loader(1.5)
                setTimeout(() => {
                    alert_toast('success', "Note successfully saved.", 1800)
                }, 1500);
            })
            .catch((err) => {
                end_loader(0)
                alert_toast('error', "An error occured while saving the note. Please try again")
            })
    })
    $('#reset').click(function() {
        form_reset()
    })
    $('#delete').click(function(e) {
        e.preventDefault()
        confirm_toast("Are you sure to delete \"" + $('[name="title"]').text() + "\" from notes list?", $('#noteForm').attr('data-id'))
    })
    $('#confirm_delete').click(function(e) {
        e.preventDefault()
        start_loader()
        var _this = $(this)
        var _delete_process = new Promise((resolve, reject) => {
            if (delete_note($(this).attr('data-id'))) {
                resolve()
            } else {
                reject()
            }
        })
        _delete_process
            .then(() => {
                form_reset()
                $('.note-item[data-id="' + _this.attr('data-id') + '"]').remove()
            })
            .then(() => {
                end_loader(.5)
                $('#confirm_toast').toast('hide')
                setTimeout(() => {
                    alert_toast('success', "Note successfully deleted.", 1500)
                }, 500);
            })
            .catch(() => {
                end_loader()
                alert_toast('error', "An error occured. Please reload the page and execute the action again.", 0)
            })
    })

})
window.form_reset = function() {
    $('.hide-load').hide('fast')
    $('[name="title"]').html('')
    $('[name="note"]').html('')
    $('#noteForm').attr('data-id', '')
    $('#noteForm .card-title').text('New Note')

}
window.get_notes = function() {
    var notes = localStorage.getItem("notes")
    if (!notes)
        notes = {}
    else
        notes = JSON.parse(notes)
    return notes;
}
window.get_note_single = function(id) {
    var notes = localStorage.getItem("notes")
    if (!notes)
        notes[id] = {}
    else
        notes = JSON.parse(notes)
        // console.log(notes[id])
    return notes[id];
}
window.load_notes = function() {
    var notes = get_notes();
    var note, item;
    $('#note_list').html("<center><i>Lodaing data...</i></center>")
    if (Object.keys(notes).length > 0) {
        $('#note_list').html("")
        Object.keys(notes).map(k => {
            note = notes[k]
            item = $('#note_collpased .note-item').clone()
            item.find('.card-title').html(note.title)
            item.find('.card-body').html(note.note)
            item.attr('data-id', note.id)
            $('#note_list').append(item)
        })
    } else {
        $('#note_list').html("<center><i>No notes listed yet.</i></center>")
    }
    $('.note-item').click(function(e) {
        e.preventDefault()
        edit_note($(this).attr('data-id'))
    })
    _search()
    return true;
}
window.load_notes_single = function(id) {
    var notes = get_notes();
    var note, item;
    if (!!notes[id]) {
        note = notes[id]
        item = $('#note_collpased .note-item').clone()
        item.find('.card-title').html(note.title)
        item.find('.card-body').html(note.note)
        item.attr('data-id', note.id)
        if ($('.note-item[data-id="' + id + '"]').length > 0) {
            old = $('.note-item[data-id="' + id + '"]')
            old.hide()
                .after(item)
                .remove()
        } else
            $('#note_list').append(item);
    }
    item.click(function(e) {
        e.preventDefault()
        edit_note(id)
    })
    _search()
    return true;
}
window.save_note = function() {
    var notes = localStorage.getItem("notes")
    var title = $('[name="title"]').html()
    var note = $('[name="note"]').html()
    var id = $('#noteForm').attr('data-id')
    if (title == '' && note == '') {
        return false;
    }
    var new_data = { 1: { id: '1', title: '', note: '' } };
    notes = $.parseJSON(notes) || {};

    if (id <= 0)
        id = Object.keys(notes).length > 0 ? parseInt($('#note_list .note-item').last().attr('data-id')) + 1 : 1;
    console.log(id)
    $('#noteForm').attr('data-id', id);
    new_data = {
        [id]: { id: id, title: title, note: note }
    };
    notes[id] = new_data[id];
    if (Object.keys(notes).length > 0)
        window.localStorage.setItem("notes", JSON.stringify(notes))
    return true;
}
window.edit_note = function(id) {
    start_loader()
    var _load = new Promise((resolve, reject) => {
        form_reset()
        var data = get_note_single(id)
        $('#noteForm').attr('data-id', id)
        $('#noteForm .card-title').text('Edit Note')
        $('[name="title"]').html(data.title)
        $('[name="note"]').html(data.note)
        $('#update,#delete,#reset').show('fast')
        resolve()
    })

    _load
        .then(function() {
            end_loader(.2)
        })
        .catch(() => {
            end_loader()
            alert_toast('error', "An error occured. Please reload the page")
        })

}
window.delete_note = function(id) {
    var notes = localStorage.getItem("notes")
    notes = JSON.parse(notes)
    delete notes[id];
    window.localStorage.setItem('notes', JSON.stringify(notes))
    return true;
}