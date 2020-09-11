import {gql} from '@apollo/client'

export const GET_TESTS = gql`
query{
  allTests{
    content
    _id
  }
}
`

export const GET_MAPS = gql`
query{
  allMaps{
    name
    dimensions
    grid
    _id
  }
}
`

export const FIND_MAP = gql`
query findMap($name: String!){
  findMap(name: $name){
    dimensions
    grid
    _id
  }
}
`