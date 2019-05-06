const { createRemoteFileNode } = require(`gatsby-source-filesystem`)

const processNode = (createContentDigest, node) => {
  const { __type } = node
  delete node.__type

  if (__type === "wcProducts" && node.categories) {
    node.categories.forEach(category => {
      // Add wordpress_id field when there is no
      // categories connection to keep the id access
      // consistent between just products & products with
      // categories
      category.wordpress_id = category.id
    })
  }

  const nodeContent = JSON.stringify(node)

  const nodeData = Object.assign({}, node, {
    id: node.id,
    wordpress_id: node.wordpress_id,
    parent: null,
    children: [],
    internal: {
      type: __type,
      contentDigest: createContentDigest(nodeContent),
    },
  })

  return nodeData
}

// Create links between products and categories (bi-directional)
const mapProductsToCategories = nodes => {
  const categories = nodes.filter(
    node => node.__type === "wcProductsCategories"
  )

  return nodes.map(node => {
    if (categories.length && node.__type === "wcProducts") {
      node.categories.forEach(({ id }) => {
        const category = categories.find(c => id === c.wordpress_id)
        if (category) {
          if (!node.categories___NODE) {
            // Initialise the connection array if necessary
            node.categories___NODE = []
          }
          // Add the current category ID to the connection array
          node.categories___NODE.push(category.id)

          if (!category.products___NODE) {
            // Initialise the product connection array if necessary
            category.products___NODE = []
          }
          // Add the current product's ID to the connection array
          category.products___NODE.push(node.id)
        }
      })
      if (node.categories___NODE) {
        // Remove the old categories field if
        // nodes are now being referenced
        delete node.categories
      }
    }
    return node
  })
}

const mapProductsToTags = nodes => {
  const tags = nodes.filter(node => node.__type === "wcProductsTags")

  return nodes.map(node => {
    if (tags.length && node.__type === "wcProducts") {
      node.tags.forEach(({ id }) => {
        const tag = tags.find(t => id === t.wordpress_id)
        if (tag) {
          if (!node.tags___NODE) {
            // Initialise the connection array if necessary
            node.tags___NODE = []
          }
          // Add the current tag ID to the connection array
          node.tags___NODE.push(tag.id)

          if (!tag.products___NODE) {
            // Initialise the connection array if necessary
            tag.products___NODE = []
          }

          //Add the current product's ID to the connection array
          tag.products___NODE.push(node.id)
        }
      })
      if (node.tags___NODE) {
        // Remove the old tags field if
        // nodes are now being referenced
        delete node.tags
      }
    }
    return node
  })
}

const mapRelatedProducts = nodes => {
  const products = nodes.filter(node => node.__type === "wcProducts")

  return nodes.map(node => {
    if (node.__type === "wcProducts") {
      const related_products = node.related_ids
        ? node.related_ids.map(id => {
            const product = products.find(
              product => product.wordpress_id === id
            )
            return product ? product.id : null
          })
        : null
      if (related_products) {
        node.related_products___NODE = related_products
      } else {
        node.related_products = []
      }
    }
    return node
  })
}

const mapGroupedProducts = nodes => {
  const products = nodes.filter(node => node.__type === "wcProducts")

  return nodes.map(node => {
    if (node.__type === "wcProducts") {
      const grouped_products = node.grouped_products
        ? node.grouped_products.map(id => {
            const product = products.find(
              product => product.wordpress_id === id
            )
            return product ? product.id : null
          })
        : null
      if (grouped_products) {
        node.grouped_products_nodes___NODE = grouped_products
      } else {
        node.grouped_products_nodes = []
      }
    }
    return node
  })
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
    touchNode({ nodeId: fileNodeID })
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

module.exports = {
  processNode,
  normaliseFieldName,
  mapMediaToNodes,
  mapProductsToCategories,
  mapProductsToTags,
  mapRelatedProducts,
  mapGroupedProducts,
}
