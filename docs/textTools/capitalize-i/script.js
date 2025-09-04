// Capitalize all ' i ' surrounded by spaces
const input = document.getElementById('inputText');
const output = document.getElementById('outputText');

function capitalizeI(text) {
    // Replace ' i ' with ' I ' only when surrounded by spaces or at start/end
    return text.replace(/(\s|^)i(\s|$)/g, function (match, p1, p2) {
        return p1 + 'I' + p2;
    });
}

input.addEventListener('input', function () {
    output.value = capitalizeI(input.value);
});
