export interface IObjectWithId {
    id: string;
}

export const insertItem = <T extends IObjectWithId>(array: T[], item: T, index: number = 0) => {
    let newArray = array.slice()
    newArray.splice(index, 0, item)
    return newArray
}

export const removeItem = <T extends IObjectWithId>(array: T[], item: T & { id: string }) => {
    return array.filter(i => i.id !== item.id)
}

export const updateObjectInArray = <T extends IObjectWithId>(array: T[], item: T) => {
    return array.map(i => {
        if (i.id !== item.id) {
            // This isn't the item we care about - keep it as-is
            return item
        }

        // Otherwise, this is the one we want - return an updated value
        return Object.assign(i, item);
    })
}