const WooCommerceAPI = require("woocommerce-api")
const {
  processNode,
  normaliseFieldName,
  mapMediaToNodes,
} = require("./helpers")

exports.sourceNodes = async (
  { actions, createNodeId, createContentDigest, store, cache },
  configOptions
) => {
  const { createNode, touchNode } = actions
  delete configOptions.plugins

  const { api, https, api_keys, fields, api_version, per_page } = configOptions

  // set up WooCommerce node api tool
  const WooCommerce = new WooCommerceAPI({
    url: `http${https ? "s" : ""}://${api}`,
    consumerKey: api_keys.consumer_key,
    consumerSecret: api_keys.consumer_secret,
    wpAPI: true,
    version: api_version || "wc/v1",
  })

  // Fetch Node and turn our response to JSON
  const fetchNodes = async fieldName => {
    const endpoint = per_page ? fieldName + `?per_page=${per_page}` : fieldName

    const res = await WooCommerce.getAsync(endpoint)
    const json = res.toJSON()
    if (json.statusCode !== 200) {
      console.warn(`
        \n========== WARNING FOR FIELD ${fieldName} ==========\n`)
      console.warn(`The following error message was produced: ${json.body}`)
      console.warn(`\n========== END WARNING ==========\n`)
      return []
    }
    return JSON.parse(json.body)
  }

  // Loop over each field set in configOptions and process/create nodes
  async function fetchNodesAndCreate(array) {
    for (const field of array) {
      let nodes = await fetchNodes(field)
      const fieldName = normaliseFieldName(field)
      nodes = await mapMediaToNodes({
        nodes,
        store,
        cache,
        createNode,
        createNodeId,
        touchNode,
      })

      nodes.forEach(n =>
        createNode(processNode(createNodeId, createContentDigest, n, fieldName))
      )
    }
  }

  // Leh go...
  await fetchNodesAndCreate(fields)
  return
}
