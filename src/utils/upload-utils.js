const MEGABYTE = 1024 * 1024;

function getSizeString(bytes) {
    return parseFloat((bytes / MEGABYTE).toFixed(2)).toString();
}

export {
    getSizeString
};
