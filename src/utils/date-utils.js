import moment from 'moment';

function formatDate(date) {
    return moment(date).utc(true).format();
}

function formatDateToString(date) {
    return moment(date).utc(true).format('LL');
}

export {
    formatDate,
    formatDateToString
};
