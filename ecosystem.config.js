module.exports = {
    apps : [
      {
        name: "morion-dev",
        script: "yarn",
        args: "dev"
      },
      {
        name: "morion-build",
        script: "yarn",
        args: "build"
      },
      {
        name: "morion-prod",
        script: "node",
        args: "./.output/server/index.mjs"
      }
    ]
  }