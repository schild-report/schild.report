import { GitProcess } from 'dugite'
const GitUrlParse = require('git-url-parse')
const path = require('path')

export const Repo = {
  clone: async function (address, destination) {
    console.log(address)
    const name = GitUrlParse(address).name
    const repoPath = path.join(destination, name)
    console.log(repoPath)
    const repo = await GitProcess.exec(['clone', address, repoPath])
    console.log(repo)
    if (repo.stderr) {
      throw repo.stderr
    } else {
      console.log(name + ' geklont')
      return name
    }
  },
  pull: function (repo) {
    console.log(repo)
    GitProcess.exec(['pull', 'origin', repo])
      .then(repo => { console.log('master: ' + repo) })
      .catch(err => console.log(err))
  }
}
