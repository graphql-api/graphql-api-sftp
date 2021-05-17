import { IResolvers } from 'apollo-server-micro'
import { SFTPDataSource } from './dataSource'
import { FileInfo } from 'ssh2-sftp-client'
import { scalarResolvers } from './scalars'

export const resolvers: IResolvers<
  any,
  { dataSources: { sftp: SFTPDataSource } }
> = {
  ...scalarResolvers,
  Child: {
    __resolveType(obj: FileInfo, context, info) {
      switch (obj.type) {
        case '-':
          return 'File'
        case 'd':
          return 'Folder'
        case 'l':
          return null
      }
    }
  },
  Folder: {
    async children(root, args, { dataSources }) {
      const children = await dataSources.sftp.list(root.path)
      return children.map((child) => ({
        path: `${root.path}/${child.name}`,
        ...child
      }))
    }
  },
  Query: {
    async folder(root, args, { dataSources }) {
      const children = await dataSources.sftp.list(args.path)
      return children.map((child) => ({
        path: `${args.path}/${child.name}`,
        ...child
      }))
    }
  },
  Mutation: {
    async createFolder(root, args, { dataSources }) {
      await dataSources.sftp.createFolder(args.path)
      const parts = args.path.split('/')
      const name = parts[parts.length - 1]
      const siblings = await dataSources.sftp.list(
        parts.slice(0, parts.length - 1).join('/')
      )
      const folder = siblings.find((n) => n.name === name)
      if (folder) {
        const children = await dataSources.sftp.list(args.path)
        return {
          ...folder,
          path: args.path,
          children: children.map((child) => ({
            path: `${args.path}/${child.name}`,
            ...child
          }))
        }
      }
      return null
    },
    async uploadFile(root, args, { dataSources }) {
      const upload = await dataSources.sftp.uploadFile({
        path: args.path,
        data: args.file
      })
      return dataSources.sftp.getFile(args.path)
    }
  }
}
