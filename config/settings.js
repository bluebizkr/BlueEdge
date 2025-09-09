module.exports = {
    // The httpRoot path for the UI
    httpAdminRoot: "/red",

    // The httpRoot path for the static content of the UI
    httpStatic: "/red",

    // The port that the Node-RED UI will listen on
    uiPort: 1880,

    // Disable the editor for production environments if flows are baked into the image
    // disableEditor: false,

    // Credential secret for flows
    // credentialSecret: "a-long-random-string-for-production",

    // To enable project feature
    // projects: {
    //     enabled: true
    // },

    // To enable external modules
    // externalModules: {
    //     palette: {
    //         allowInstall: true,
    //         allowUpload: true
    //     },
    //     npmInstall: {
    //         // If true, Node-RED will attempt to install missing modules on startup
    //         // This should be false in production
    //         autoInstall: true,
    //         // If true, Node-RED will attempt to install missing modules on startup
    //         // This should be false in production
    //         autoInstall: true
    //     }
    // },

    // Other settings can go here
};