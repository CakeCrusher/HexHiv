import {gql} from '@apollo/client'

export const MAKE_MAP = gql`
mutation makeMap(
    $name: String!
    $dimensions: [Int!]!
    $grid: [Boolean!]!
) {
    makeMap(name: $name, dimensions: $dimensions, grid: $grid) {
        name
        _id
    }
}
`