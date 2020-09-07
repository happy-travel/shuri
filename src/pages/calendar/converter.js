import moment from 'moment';

export const convertRangesToForm = (ranges, contract) => {
    let values = {};
    const findSeasonId = (date) => {
        for (let i = 0; i < ranges.length; i++) {
            if ((new Date(date) >= new Date(ranges[i].startDate) &&
                (new Date(date) <= new Date(ranges[i].endDate)))) {
                return ranges[i].seasonId;
            }
        }
        return null;
    };
    for (
        let date = new Date(contract.validFrom);
        date <= new Date(contract.validTo);
        date.setDate(date.getDate()+1)
    ) {
        values[Number(date)] = findSeasonId(date);
    }
    return values;
};

const formatServerDate = date => moment(date).utc(true).format();

export const convertFormToRanges = (values, contract) => {
    const result = [];
    for (
        let date = new Date(contract.validFrom);
        date <= new Date(contract.validTo);
        date.setDate(date.getDate()+1)
    ) {
        const seasonId = parseInt(values[Number(date)]);
        const serverDate = formatServerDate(date);
        if (result.length && result[result.length-1].seasonId === seasonId) {
            result[result.length-1].endDate = serverDate;
        } else {
            result.push({
                id: result.length + 1,
                seasonId,
                startDate: serverDate,
                endDate: serverDate
            });
        }
    }
    return result;
};

export const formatSeasons = (seasonsList) => {
    const seasons = {};
    seasonsList.forEach(season => seasons[season.id] = season.name);
    return seasons;
};
