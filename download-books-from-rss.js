const fs = require('fs')
const path = require('path')
const convert = require('xml-js')
const axios = require('axios')
const mkdirp = require('mkdirp')

main(process.argv[2]).catch(err => {
    console.error(err)
    process.exit(1)
})

const getPDFOptions = {
    responseType: 'arraybuffer',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/pdf'
    }
}

async function main(url) {
    const response = await axios.get(url)
    const feed = convert.xml2js(response.data, { compact: true }).feed

    for (const entry of feed.entry) {
        const pdfUrl = getDownloadLink(entry)
        const filename = getNormalizedFilename(entry)
        console.log(`Downloading ${pdfUrl} to ${filename}`)
        const pdf = await axios.get(pdfUrl,  getPDFOptions)

        mkdirp(path.dirname(filename))
        fs.writeFileSync(filename, pdf.data)
    }

    if (hasNextLink(feed)) {
        await main(getNextLink(feed))
    }
}

function hasNextLink(feed) {
    return feed.link.some(link => link._attributes.rel === 'next')
}

function getNextLink(feed) {
    return feed.link.find(link => link._attributes.rel === 'next')._attributes.href
}

function getNormalizedFilename(entry) {
    return path.join(getLevel(entry), normalize(entry.title._text)) + '.pdf'
}

function getLevel(entry) {
    return normalize(entry['lrmi:educationalAlignment']._attributes.targetName)
}

function normalize(text) {
    return text.replace(/\W+/g, '_')
}

function getDownloadLink(entry) {
    return entry.link.find(link => link._attributes.type === 'application/pdf')._attributes.href
}