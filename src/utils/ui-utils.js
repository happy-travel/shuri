function getRatesTree(ratesList, seasonsList) {
    const ratesTree = new Map();
    ratesList.forEach((rate) => {
        const { seasonId, roomId } = rate;
        const roomsMap = ratesTree.get(seasonId)?.data;
        if (!roomsMap) {
            ratesTree.set(
                seasonId,
                {
                    isExpanded: false,
                    data: new Map([[roomId, [rate]]])
                }
            );
        } else if (!roomsMap.has(roomId)) {
            roomsMap.set(roomId, [rate]);
        } else {
            roomsMap.get(roomId).push(rate);
        }
    });
    seasonsList.forEach((season) => {
        if (!ratesTree.has(season.id)) {
            ratesTree.set(season.id, { isExpanded: false, data: new Map() })
        }
    });
    return ratesTree;
}

function getSelectOptions(keys, transformer) {
    return keys.map((key) => ({ value: key, text: transformer(key) }));
}

export {
    getRatesTree,
    getSelectOptions
}
