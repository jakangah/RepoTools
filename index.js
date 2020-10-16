require('dotenv').config()
const github = require('octonode');
const Promise = require('bluebird');
const { writeFileSync, readFileSync } = require('fs');
const DATA_DIRECTORY = process.env.DATA_DIRECTORY || './data'
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || 'TOKEN_NOT_SET'
const GH_CLIENT = github.client(GITHUB_TOKEN);


async function fetchFile(fileName) {
    try {
        return readFileSync(DATA_DIRECTORY + fileName, 'utf-8')
    } catch (error) {
        console.error(error)
        return null
    }

}

async function writeFile(fileName, data) {
    try {
        return writeFileSync(DATA_DIRECTORY + fileName, JSON.stringify(data))
    } catch (error) {
        console.error(error)
        return null
    }
}

async function getUser(refresh = false) {
    let file = await fetchFile('/user.json');
    if (file) {
        file = JSON.parse(file)
        return file;
    }
    const [status, user, headers] = await GH_CLIENT.getAsync('/user', {});
    if (status && user && headers) await writeFile('/user.json', { user, status, headers })
    return { user, headers }
}

async function getRepos() {

    const r = await GH_CLIENT.getAsync('/notifications', {
        participating: true
    })
    await Promise.map(r[1],async a=>{
        console.log({a})
    })


    let file = await fetchFile('/repos.json');
    if (file) {
        file = JSON.parse(file)
        return file;
    }
    const [repos, headers] = await GH_CLIENT.me().reposAsync({
        per_page: 100,
        org: 'Wiredcraft'
    });
    if (repos && headers) await writeFile('/repos.json', { repos, headers })
    return { repos, headers }
}
/**
 * 
 * @param {*} page 
 * @param {*} per_page 
 * @param {*} filter 
 * @param {*} state 
 * @param {*} sort 
 */
async function getIssues(page = 1, per_page = 100, filter = 'assigned', state = 'open', sort = 'created') {
    return GH_CLIENT.issues({
        page,
        per_page,
        filter,
        state,
        sort
    });
}

/**
 * 
 * @param {*} org 
 * @param {*} repo 
 */
async function getRepoPrs(org, repo) {
    const repoClient = GH_CLIENT.repo(`${org}/${repo}`)
    const [prs, headers] = await repoClient.prsAsync({ per_page: 100, state: 'open', sort: 'created' })
    return { prs, headers }
}

async function main() {
    const r = await getRepos();
    // const { user } = await getUser()
    // const { prs } = await getRepoPrs('Wiredcraft', 'omni-events')
    // const userPrs = await Promise.filter(prs, async (pr) => pr.user.login === user.login)
    // console.log(userPrs)
}


main();
