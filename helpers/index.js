const crypto = require("crypto")
const { createRemoteFileNode } = require(`gatsby-source-filesystem`)

const processNode = (createNodeId, node, fieldName) => {
  const nodeId = createNodeId(`woocommerce-${fieldName}-${node.id}`)
  const nodeContent = JSON.stringify(node)
  const nodeContentDigest = crypto
    .createHash("md5")
    .update(nodeContent)
    .digest("hex")

  const nodeData = Object.assign({}, node, {
    id: nodeId,
    wordpress_id: node["id"],
    parent: null,
    children: [],
    internal: {
      type: `WC${capitalize(fieldName)}`,
      content: nodeContent,
      contentDigest: nodeContentDigest,
    },
  })
  return nodeData
}

// Turn multi part endpoints into camelCase
// e.g. products/categories becomes productsCategories
const normaliseFieldName = name => {
  const parts = name.split("/")
  return parts.reduce((whole, partial) => {
    if (whole === "") {
      return whole.concat(partial)
    }
    return whole.concat(partial[0].toUpperCase() + partial.slice(1))
  }, "")
}

const downloadMedia = async ({
  n,
  image,
  store,
  cache,
  touchNode,
  createNode,
  createNodeId,
}) => {
  let fileNodeID
  const mediaDataCacheKey = `wordpress-media-${image.id}`
  const cacheMediaData = await cache.get(mediaDataCacheKey)

  if (cacheMediaData && n.modified === cacheMediaData.modified) {
    fileNodeID = cacheMediaData.fileNodeID
    touchNode({ nodeId: cacheMediaData.fileNodeID })
  }

  if (!fileNodeID) {
    try {
      const fileNode = await createRemoteFileNode({
        url: image.src,
        store,
        cache,
        createNode,
        createNodeId,
        parentNodeId: n.id.toString(),
      })

      if (fileNode) {
        fileNodeID = fileNode.id

        await cache.set(mediaDataCacheKey, {
          fileNodeID,
          modified: n.modified,
        })
      }
    } catch (e) {
      // Ignore
    }
  }
  if (fileNodeID) {
    image.localFile___NODE = fileNodeID
  }
}

const mapMediaToNodes = async ({
  nodes,
  store,
  cache,
  createNode,
  createNodeId,
  touchNode,
}) => {
  return Promise.all(
    nodes.map(async n => {
      const commonParams = {
        n,
        store,
        cache,
        touchNode,
        createNode,
        createNodeId,
      }

      if (n.images && n.images.length) {
        await n.images.map(async image => {
          downloadMedia({
            image,
            ...commonParams,
          })
        })
        return n
      } else if (n.image && n.image.id) {
        const { image } = n
        await downloadMedia({
          image,
          ...commonParams,
        })

        return n
      } else {
        return n
      }
    })
  )
}

module.exports = { processNode, normaliseFieldName, mapMediaToNodes }

// Helper Helpers
function capitalize(s) {
  return s[0].toUpperCase() + s.slice(1)
}
