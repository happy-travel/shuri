function getEntitiesTree(entityList, auxiliaryEntityList, keyName = 'seasonId') {
    const entityTree = new Map();
    entityList.forEach((entity) => {
        const { [keyName]: entityKeyName, roomId } = entity;
        const roomsMap = entityTree.get(entityKeyName)?.data;
        if (!roomsMap) {
            entityTree.set(
                entityKeyName,
                {
                    isExpanded: false,
                    data: new Map([[roomId, [entity]]])
                }
            );
        } else if (!roomsMap.has(roomId)) {
            roomsMap.set(roomId, [entity]);
        } else {
            roomsMap.get(roomId).push(entity);
        }
    });
    auxiliaryEntityList.forEach((auxiliaryEntity) => {
        if (!entityTree.has(auxiliaryEntity.id)) {
            entityTree.set(auxiliaryEntity.id, { isExpanded: false, data: new Map() })
        }
    });
    return entityTree;
}

function getSelectOptions(keys, transformer) {
    return keys.map((key) => ({ value: key, text: transformer(key) }));
}

export {
    getEntitiesTree,
    getSelectOptions
}
