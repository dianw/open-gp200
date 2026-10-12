/**
 * Effect model -> name, per module number, keyed `${category}:${id}` where id is dump module
 * block +8 and category is +11 (the same id means different effects under different categories).
 * Ids do NOT follow the manual's list order (Blues OD is id 9 but 15th in the PRE list),
 * so this table is filled only from ids confirmed on the device.
 */
export const MODEL_NAMES: Record<number, Record<string, string>> = {
  0: {
    // PRE, confirmed on the device (id = dump +8; +11 was 3 for the OD ones, 0 for the boosts)
    '3:1': 'OD 9',
    '3:2': 'Yellow OD', // inferred: left selected after stepping Super OD, Penesas, Yellow OD
    '3:9': 'Blues OD',
    '0:25': 'FAT BB',
    '0:26': 'Boost',
  },
}

export function modelName(module: number, type: number, category: number): string {
  return MODEL_NAMES[module]?.[`${category}:${type}`] ?? `Model ${category}:${type}`
}
