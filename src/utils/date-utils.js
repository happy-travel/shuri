import moment from 'moment';

function formatDate(date) {
    return moment(date).utc(true).format();
}

export {
    formatDate
};
