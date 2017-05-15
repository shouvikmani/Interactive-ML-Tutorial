var i, checkboxes = document.querySelectorAll('.w-checkbox-input');

function save() {
    for (i = 0; i < checkboxes.length; i++) {
        localStorage.setItem(checkboxes[i].name, checkboxes[i].checked);
    }
}

function load_() {
    for (i = 0; i < checkboxes.length; i++) {
        checkboxes[i].checked = localStorage.getItem(checkboxes[i].name) === 'true' ? true:false;
        console.log(checkboxes[i].name);
    }
}
