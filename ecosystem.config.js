module.exports = {
    apps : [
      {
        name: "d24-dev",
        script: "yarn",
        args: "dev"
      },
      {
        name: "d24-build",
        script: "yarn",
        args: "build"
      },
      {
        name: "d24-prod",
        script: "node",
        args: "./.output/server/index.mjs"
      }
    ]
  }