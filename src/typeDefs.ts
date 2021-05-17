import { gql } from 'graphql-tag'
import { scalarDefs } from './scalars'
/**https://nsftools.com/tips/RawFTP.htm */

export const typeDefs = gql`
  ${scalarDefs}

  enum FileType {
    ASCII
    EBCDIC
    Image
    LocalFormat
  }

  interface Child {
    path: String
    name: String
  }

  type File implements Child {
    url: String
    path: String
    size: Int
    name: String
  }

  type Edge {
    node: Child
  }

  type Connection {
    edges: [Edge]
    children: [Edge]
    parents: [Edge]
  }

  type Folder implements Child {
    path: String
    name: String
    size: Int
    children: [Child]
  }

  extend type Query {
    folder(path: String): [Child]
    rootFolders: [Folder]
  }

  extend type Mutation {
    uploadFile(input: UploadFileInput): File
    deleteFile(id: String): File
    createFolder(path: String): Folder
    deleteFolder: Folder
    updateFolder: Folder
  }

  input UploadFileInput {
    file: Upload!
    path: String
  }
`
