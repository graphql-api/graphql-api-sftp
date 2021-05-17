import { DataSource } from 'apollo-datasource'
import { ApolloError } from 'apollo-server-errors'
import { InMemoryLRUCache, KeyValueCache } from 'apollo-server-caching'
import Client from 'ssh2-sftp-client'

/**
 * https://github.com/theophilusx/ssh2-sftp-client
 *
 */

export class SFTPDataSource extends DataSource<any> {
  protected _connectOptions: Client.ConnectOptions
  protected client?: Promise<Client>
  context?: any

  constructor(connectOptions: Client.ConnectOptions) {
    super()
    this._connectOptions = connectOptions
    this.client = new Promise((res, rej) => {
      const client = new Client()
      client.connect(this._connectOptions).then(() => {
        res(client)
      })
    })
  }

  /** FILE */

  async getFile(path) {
    const client = await this.client
    const data = await client.stat(path)
    client.end()
    return data
  }

  async uploadFile({ path, data }: { path; data: Buffer }) {
    const client = await this.client
    client.put(data, path, { autoClose: true })
  }
  async download() {}
  async rename() {}

  /** FOLDER */

  async list(path) {
    const client = await this.client
    const data = await client.list(path)
    client.end()
    return data
  }

  async createFolder(path) {
    const client = await this.client
    return client
      .mkdir(path)
      .then((value) => {
        return true
      })
      .catch((err) => ({ err }))
  }

  async deleteFolder(path) {
    const client = await this.client
    client.rmdir(path)
  }

  async renameFolder({ path, newPath }) {
    const client = await this.client
    client.rename(path, newPath)
  }

  initialize({
    context,
    cache
  }: { context?: any; cache?: KeyValueCache } = {}) {
    this.context = context
  }
}
