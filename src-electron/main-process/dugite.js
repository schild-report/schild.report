import { GitProcess } from 'dugite'
import GitUrlParse from 'git-url-parse'
import { join } from 'path'

export const Repo = {
  clone: async function (address, destination) {
    console.log(address)
    const name = GitUrlParse(address).name
    const repoPath = join(destination, name)
    console.log(repoPath)
    try {
      const repo = await GitProcess.exec(['clone', address, repoPath])
      console.log(repo)
      if (repo.exitCode === 0) {
        return name
      } else {
        throw repo.stderr
      }
    } catch (e) {
      console.log(e)
      throw e
    }
  },
  pull: function (repo) {
    console.log(repo)
    GitProcess.exec(['pull', 'origin', repo])
      .then(repo => { console.log('master: ' + repo) })
      .catch(err => console.log(err))
  }
}
