// in appveyor.yml verwendete env vars
export const VERSION = { buildID: '%APPVEYOR_BUILD_ID%', buildVersion: '%APPVEYOR_BUILD_VERSION%', buildNo: '%APPVEYOR_BUILD_NUMBER%', gitHash: '%APPVEYOR_REPO_COMMIT%', gitMessage: '%APPVEYOR_REPO_COMMIT_MESSAGE%', production: false }
