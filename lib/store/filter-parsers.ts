import { parseAsArrayOf, parseAsString, parseAsInteger } from 'nuqs'

const multiString = parseAsArrayOf(parseAsString).withDefault([])
const multiInteger = parseAsArrayOf(parseAsInteger).withDefault([])

export const filterParsers = {
    q: parseAsString.withDefault(''),
    category: parseAsString.withDefault('All'),
    conditions: multiString,
    brands: multiString,
    rams: multiInteger,
    storages: multiInteger,
    networks: multiString,
    os: multiString,
    colors: multiString,
    minPrice: parseAsString.withDefault(''),
    maxPrice: parseAsString.withDefault(''),
    sort: parseAsString.withDefault('newest'),
}