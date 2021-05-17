import { gql } from 'graphql-tag'
import { GraphQLUpload } from 'graphql-upload'
import { URLResolver, URLTypeDefinition } from 'graphql-scalars'

export const scalarDefs = gql`
  scalar Upload
  ${URLTypeDefinition}
`

export const scalarResolvers = {
  Upload: GraphQLUpload,
  URL: URLResolver
}
