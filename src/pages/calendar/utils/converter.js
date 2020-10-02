import { formatDate } from 'utils/date-utils';

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

export const convertFormToRanges = (values, contract) => {
    const result = [];
    for (
        let date = new Date(contract.validFrom);
        date <= new Date(contract.validTo);
        date.setDate(date.getDate()+1)
    ) {
        const seasonId = parseInt(values[Number(date)]);
        const serverDate = formatDate(date);
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
    seasonsList.forEach((season) => seasons[season.id] = season.name);
    return seasons;
};

export const convertRestrictionsToForm = (restrictions, contract) => {
    let values = {};
    const findRestriction = (date) => {
        for (let i = 0; i < restrictions.length; i++) {
            if ((new Date(date) >= new Date(restrictions[i].fromDate) &&
                (new Date(date) <= new Date(restrictions[i].toDate)))) {
                return restrictions[i].restriction;
            }
        }
        return 'freeSale';
    };
    for (
        let date = new Date(contract.validFrom);
        date <= new Date(contract.validTo);
        date.setDate(date.getDate()+1)
    ) {
        values[Number(date)] = findRestriction(date);
    }
    return values;
}

export const convertFormToRestrictions = (values, contract, roomId) => {
    const result = [];
    for (
        let date = new Date(contract.validFrom);
        date <= new Date(contract.validTo);
        date.setDate(date.getDate()+1)
    ) {
        const restriction = values[Number(date)];
        const serverDate = formatDate(date);
        if (result.length && result[result.length - 1].restriction === restriction) {
            result[result.length - 1].toDate = serverDate;
        } else {
            result.push({
                roomId,
                restriction,
                fromDate: serverDate,
                toDate: serverDate
            });
        }
    }
    return result;
};
