export const agesReformat = (definition) => {
    const result = {};
    const keys = ['infant', 'child', 'teen', 'adult'];
    let lastEnabled = null;

    for (let index = 0; index < keys.length; index++) {
        let key = keys[index];
        let item = definition[key];
        if (item?.enabled || key === 'adult') {
            result[key] = {
                lowerBound: item.lowerBound
            };
            if (lastEnabled !== null) {
                result[lastEnabled].upperBound = Math.max(0, item.lowerBound - 1);
            }
            lastEnabled = key;
        }
    }

    // todo : temporary
    result.adult.upperBound = 200;
    return result;
};
