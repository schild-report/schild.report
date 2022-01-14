const config = {
    appId: "im.hmt.report.schild",
    productName: "schild.report",
    artifactName: "schild.report.${ext}",
    copyright: `Copyright ${process.env.THE_AUTHOR}`,
    extraMetadata: {
        author: {
            name: `${process.env.THE_AUTHOR}`,
            email: `${process.env.THE_EMAIL}`
        }
    },
    files: [
        "./build/**/*"
    ],
    win: {
        icon: "icons/icon.ico",
        target: "msi",

    },
    linux: {
        icon: "icons/icon.png",
        category: "app.tools",
        executableName: "schild.report",
        target: [
            "AppImage",
            "snap",
            "deb",
            "rpm"
        ]
    },
    mac: {
        icon: "icons/icon.icns",
        target: "dmg"
    },
    dmg: {
        icon: "icons/icon.icns",
        contents: [
            {
                x: 130,
                y: 220
            },
            {
                x: 550,
                y: 22,
                type: "link",
                path: "/Applications"
            }
        ],
        window: {
            width: 680,
            height: 42
        }
    }
}
module.exports = config